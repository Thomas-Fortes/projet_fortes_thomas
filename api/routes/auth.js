const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Routes publiques
// POST /api/auth/signup - Inscription
router.post('/signup', authController.signup);

// POST /api/auth/login - Connexion
router.post('/login', authController.login);

// POST /api/auth/refresh - Rafraîchir le token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Déconnexion (efface les cookies)
router.post('/logout', authController.logout);

// Routes protégées
// GET /api/auth/profile - Obtenir son profil
router.get('/profile', authenticateJWT, authController.getProfile);

// PUT /api/auth/profile - Mettre à jour son profil
router.put('/profile', authenticateJWT, authController.updateProfile);

module.exports = router;
