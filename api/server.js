const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pollutionRoutes = require('./routes/pollutions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pollutions', pollutionRoutes);

// Route de test / documentation de l'API
app.get('/', (req, res) => {
  res.json({
    message: 'API Pollution - Projet Final',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/signup': 'Inscription d\'un nouvel utilisateur',
        'POST /api/auth/login': 'Connexion (retourne accessToken et refreshToken)',
        'POST /api/auth/refresh': 'Rafraîchir le token d\'accès',
        'GET /api/auth/profile': 'Obtenir son profil (authentifié)',
        'PUT /api/auth/profile': 'Mettre à jour son profil (authentifié)'
      },
      users: {
        'GET /api/users': 'Liste des utilisateurs',
        'GET /api/users/:id': 'Détails d\'un utilisateur'
      },
      pollutions: {
        'GET /api/pollutions': 'Lister toutes les pollutions (filtrage: ?search=&type=&statut=)',
        'GET /api/pollutions/:id': 'Détails d\'une pollution',
        'GET /api/pollutions/user/me': 'Mes pollutions (authentifié)',
        'POST /api/pollutions': 'Ajouter une pollution (authentifié, avec photo)',
        'PUT /api/pollutions/:id': 'Modifier une pollution (authentifié, propriétaire)',
        'DELETE /api/pollutions/:id': 'Supprimer une pollution (authentifié, propriétaire)'
      }
    },
    documentation: {
      authentication: 'Utilisez le header "Authorization: Bearer <token>" pour les routes protégées',
      upload: 'L\'upload de photo se fait via multipart/form-data avec le champ "photo"'
    }
  });
});

// Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({
    error: 'Une erreur interne est survenue'
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée'
  });
});

// Initialisation de la base de données et démarrage du serveur
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');

    // Synchroniser les modèles (créer les tables si elles n'existent pas)
    await sequelize.sync({ alter: true });
    console.log('Modèles synchronisés avec la base de données.');

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`API disponible sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
};

initializeDatabase();

module.exports = app;
