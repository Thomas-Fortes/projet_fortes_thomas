const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pollutionRoutes = require('./routes/pollutions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:4200',
  'https://projet-pollution-front.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Permettre les requêtes sans origin (comme les appels API directs)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // En dev, accepter tout
  },
  credentials: true
}));
app.use(cookieParser());
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

// Route de seed (temporaire - à supprimer après utilisation)
app.get('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Pollution = require('./models/Pollution');

    // Vérifier si des données existent déjà
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      return res.json({ message: 'Base de données déjà initialisée', users: existingUsers });
    }

    // Données de test
    const users = [
      { nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com', password: 'password123' },
      { nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@email.com', password: 'password123' },
      { nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@email.com', password: 'password123' }
    ];

    const createdUsers = await User.bulkCreate(users, { individualHooks: true });

    const pollutions = [
      { titre: 'Déversement de déchets plastiques', description: 'Grande quantité de déchets plastiques observée sur les berges.', type: 'plastique', localisation: 'Seine, Paris 15ème', latitude: 48.8422, longitude: 2.2882, statut: 'signalee', userId: createdUsers[0].id },
      { titre: 'Fumées industrielles suspectes', description: 'Émanations de fumées noires provenant de l\'usine locale.', type: 'chimique', localisation: 'Zone industrielle de Gennevilliers', latitude: 48.9333, longitude: 2.2833, statut: 'en_cours', userId: createdUsers[1].id },
      { titre: 'Dépôt sauvage de gravats', description: 'Dépôt illégal de matériaux de construction.', type: 'dechet', localisation: 'Forêt de Fontainebleau', latitude: 48.4000, longitude: 2.7000, statut: 'signalee', userId: createdUsers[0].id },
      { titre: 'Nuisances sonores nocturnes', description: 'Bruit excessif provenant d\'un établissement de nuit.', type: 'sonore', localisation: 'Rue de Rivoli, Paris 1er', latitude: 48.8606, longitude: 2.3376, statut: 'resolue', userId: createdUsers[2].id },
      { titre: 'Pollution lumineuse excessive', description: 'Panneaux publicitaires LED très lumineux.', type: 'visuelle', localisation: 'Avenue des Champs-Élysées', latitude: 48.8698, longitude: 2.3076, statut: 'signalee', userId: createdUsers[1].id }
    ];

    const createdPollutions = await Pollution.bulkCreate(pollutions);

    res.json({
      message: 'Base de données initialisée avec succès',
      users: createdUsers.map(u => ({ email: u.email, password: 'password123' })),
      pollutions: createdPollutions.length
    });
  } catch (error) {
    console.error('Erreur seed:', error);
    res.status(500).json({ error: error.message });
  }
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
