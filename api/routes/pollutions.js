const express = require('express');
const router = express.Router();
const pollutionController = require('../controllers/pollutionController');
const { authenticateJWT } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Routes publiques
// GET /api/pollutions - Lister toutes les pollutions (avec filtrage)
router.get('/', pollutionController.getAllPollutions);

// GET /api/pollutions/:id - Détails d'une pollution
router.get('/:id', pollutionController.getPollutionById);

// Routes protégées (nécessitent authentification)
// GET /api/pollutions/user/me - Obtenir mes pollutions
router.get('/user/me', authenticateJWT, pollutionController.getMyPollutions);

// POST /api/pollutions - Ajouter une pollution (avec upload photo optionnel)
router.post('/', authenticateJWT, upload.single('photo'), handleUploadError, pollutionController.createPollution);

// PUT /api/pollutions/:id - Modifier une pollution (avec upload photo optionnel)
router.put('/:id', authenticateJWT, upload.single('photo'), handleUploadError, pollutionController.updatePollution);

// DELETE /api/pollutions/:id - Supprimer une pollution
router.delete('/:id', authenticateJWT, pollutionController.deletePollution);

module.exports = router;
