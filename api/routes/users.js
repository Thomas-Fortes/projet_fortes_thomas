const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes publiques (lecture seule)
// GET /api/users - Liste des utilisateurs
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Obtenir un utilisateur par ID
router.get('/:id', userController.getUserById);

module.exports = router;
