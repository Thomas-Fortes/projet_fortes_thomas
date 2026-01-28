const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');

// Configuration des cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' pour cross-origin en prod
  maxAge: 24 * 60 * 60 * 1000 // 24 heures
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
};

// Inscription d'un nouvel utilisateur
exports.signup = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    // Validation des champs
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        error: 'Tous les champs sont requis (nom, prenom, email, password)'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Cet email est déjà utilisé'
      });
    }

    // Créer l'utilisateur (le mot de passe sera hashé automatiquement via le hook beforeCreate)
    const user = await User.create({
      nom,
      prenom,
      email,
      password
    });

    // Générer les tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Envoyer les tokens dans des cookies HttpOnly
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.status(201).json({
      message: 'Inscription réussie',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);

    // Gérer les erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Erreur serveur lors de l\'inscription'
    });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        error: 'Identifiants incorrects'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants incorrects'
      });
    }

    // Générer les tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Envoyer les tokens dans des cookies HttpOnly
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: 'Connexion réussie',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la connexion'
    });
  }
};

// Rafraîchir le token
exports.refreshToken = async (req, res) => {
  try {
    // Lire le refresh token depuis le cookie ou le body (rétrocompatibilité)
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token requis'
      });
    }

    // Vérifier le refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      // Effacer les cookies si le token est invalide
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', refreshCookieOptions);
      return res.status(401).json({
        error: 'Refresh token invalide ou expiré'
      });
    }

    // Rechercher l'utilisateur
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Générer de nouveaux tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Envoyer les nouveaux tokens dans des cookies HttpOnly
    res.cookie('accessToken', newAccessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

    res.status(200).json({
      message: 'Tokens rafraîchis',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(500).json({
      error: 'Erreur serveur lors du rafraîchissement du token'
    });
  }
};

// Déconnexion (efface les cookies)
exports.logout = async (req, res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', refreshCookieOptions);
  res.status(200).json({
    message: 'Déconnexion réussie'
  });
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'nom', 'prenom', 'email', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération du profil'
    });
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          error: 'Cet email est déjà utilisé'
        });
      }
    }

    // Mettre à jour les champs
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Erreur serveur lors de la mise à jour du profil'
    });
  }
};
