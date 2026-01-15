const Pollution = require('../models/Pollution');
const User = require('../models/User');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Obtenir toutes les pollutions (public)
exports.getAllPollutions = async (req, res) => {
  try {
    const { search, type, statut, userId } = req.query;

    // Construire les conditions de filtrage
    const where = {};

    if (search) {
      where[Op.or] = [
        { titre: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { localisation: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (statut) {
      where.statut = statut;
    }

    if (userId) {
      where.userId = userId;
    }

    const pollutions = await Pollution.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(pollutions);
  } catch (error) {
    console.error('Erreur lors de la récupération des pollutions:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des pollutions'
    });
  }
};

// Obtenir une pollution par ID (public)
exports.getPollutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pollution = await Pollution.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }]
    });

    if (!pollution) {
      return res.status(404).json({
        error: 'Pollution non trouvée'
      });
    }

    res.status(200).json(pollution);
  } catch (error) {
    console.error('Erreur lors de la récupération de la pollution:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération de la pollution'
    });
  }
};

// Créer une pollution (protégé - utilisateur connecté)
exports.createPollution = async (req, res) => {
  try {
    const { titre, description, type, localisation, latitude, longitude, statut } = req.body;

    // L'utilisateur est récupéré depuis le token JWT
    const userId = req.user.id;

    // Validation
    if (!titre || !description || !type || !localisation) {
      return res.status(400).json({
        error: 'Les champs titre, description, type et localisation sont requis'
      });
    }

    // Gérer le fichier uploadé si présent
    let photoPath = null;
    if (req.file) {
      photoPath = req.file.filename;
    }

    const pollution = await Pollution.create({
      titre,
      description,
      type,
      localisation,
      latitude: latitude || null,
      longitude: longitude || null,
      photo: photoPath,
      statut: statut || 'signalee',
      userId
    });

    // Récupérer la pollution avec les infos de l'utilisateur
    const pollutionWithUser = await Pollution.findByPk(pollution.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }]
    });

    res.status(201).json(pollutionWithUser);
  } catch (error) {
    console.error('Erreur lors de la création de la pollution:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Erreur serveur lors de la création de la pollution'
    });
  }
};

// Mettre à jour une pollution (protégé - propriétaire uniquement)
exports.updatePollution = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, type, localisation, latitude, longitude, statut } = req.body;

    const pollution = await Pollution.findByPk(id);

    if (!pollution) {
      return res.status(404).json({
        error: 'Pollution non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (pollution.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à modifier cette pollution'
      });
    }

    // Gérer le fichier uploadé si présent
    if (req.file) {
      // Supprimer l'ancienne photo si elle existe
      if (pollution.photo) {
        const oldPhotoPath = path.join(process.env.UPLOAD_DIR || 'uploads', pollution.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      pollution.photo = req.file.filename;
    }

    // Mettre à jour les champs fournis
    if (titre !== undefined) pollution.titre = titre;
    if (description !== undefined) pollution.description = description;
    if (type !== undefined) pollution.type = type;
    if (localisation !== undefined) pollution.localisation = localisation;
    if (latitude !== undefined) pollution.latitude = latitude;
    if (longitude !== undefined) pollution.longitude = longitude;
    if (statut !== undefined) pollution.statut = statut;

    await pollution.save();

    // Récupérer la pollution mise à jour avec les infos de l'utilisateur
    const pollutionWithUser = await Pollution.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }]
    });

    res.status(200).json(pollutionWithUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la pollution:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Erreur serveur lors de la mise à jour de la pollution'
    });
  }
};

// Supprimer une pollution (protégé - propriétaire uniquement)
exports.deletePollution = async (req, res) => {
  try {
    const { id } = req.params;
    const pollution = await Pollution.findByPk(id);

    if (!pollution) {
      return res.status(404).json({
        error: 'Pollution non trouvée'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (pollution.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à supprimer cette pollution'
      });
    }

    // Supprimer la photo si elle existe
    if (pollution.photo) {
      const photoPath = path.join(process.env.UPLOAD_DIR || 'uploads', pollution.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await pollution.destroy();

    res.status(200).json({
      message: 'Pollution supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la pollution:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la suppression de la pollution'
    });
  }
};

// Obtenir les pollutions de l'utilisateur connecté
exports.getMyPollutions = async (req, res) => {
  try {
    const pollutions = await Pollution.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nom', 'prenom', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(pollutions);
  } catch (error) {
    console.error('Erreur lors de la récupération des pollutions:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des pollutions'
    });
  }
};
