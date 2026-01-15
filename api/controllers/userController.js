const User = require('../models/User');

// Obtenir tous les utilisateurs (sans mot de passe)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des utilisateurs'
    });
  }
};

// Obtenir un utilisateur par ID (sans mot de passe)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'nom', 'prenom', 'email', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération de l\'utilisateur'
    });
  }
};
