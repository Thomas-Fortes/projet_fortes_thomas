# API REST - Gestion des Pollutions

API REST développée avec Node.js, Express et Sequelize pour la gestion des pollutions et des utilisateurs.

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec le contenu suivant:

```
PORT=3000
DB_NAME=pollution_db
DB_HOST=localhost
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

## Démarrage

### Mode développement (avec nodemon)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

L'API sera disponible sur `http://localhost:3000`

## Endpoints API

### Utilisateurs

- **POST /api/users** - Créer un utilisateur
  ```json
  {
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@email.com",
    "password": "password123"
  }
  ```

- **GET /api/users** - Liste de tous les utilisateurs

- **GET /api/users/:id** - Détails d'un utilisateur

- **POST /api/users/login** - Authentification (fictive)
  ```json
  {
    "email": "jean.dupont@email.com",
    "password": "password123"
  }
  ```

### Pollutions

- **GET /api/pollutions** - Liste de toutes les pollutions

- **GET /api/pollutions/:id** - Détails d'une pollution

- **POST /api/pollutions** - Créer une pollution
  ```json
  {
    "titre": "Déversement de déchets",
    "description": "Déchets plastiques dans la rivière",
    "type": "eau",
    "localisation": "Rivière Seine, Paris",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "statut": "signalée",
    "userId": 1
  }
  ```

- **PUT /api/pollutions/:id** - Modifier une pollution
  ```json
  {
    "statut": "en cours"
  }
  ```

- **DELETE /api/pollutions/:id** - Supprimer une pollution

## Base de données

L'application utilise SQLite avec Sequelize ORM. La base de données est créée automatiquement au premier démarrage.

## Modèles

### User
- id (INTEGER, PK)
- nom (STRING)
- prenom (STRING)
- email (STRING, unique)
- password (STRING)
- createdAt (DATE)
- updatedAt (DATE)

### Pollution
- id (INTEGER, PK)
- titre (STRING)
- description (TEXT)
- type (STRING)
- localisation (STRING)
- latitude (FLOAT, nullable)
- longitude (FLOAT, nullable)
- statut (STRING, default: 'signalée')
- userId (INTEGER, FK)
- createdAt (DATE)
- updatedAt (DATE)
