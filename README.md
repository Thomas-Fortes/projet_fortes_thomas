# Projet Final - Application de Recensement et Gestion des Pollutions

Application web full-stack permettant de recenser, visualiser et gerer des pollutions observees sur le terrain.

## Technologies utilisees

### Backend (API)
- **Node.js** avec **Express**
- **Sequelize** ORM
- **PostgreSQL** base de donnees
- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe
- **Multer** pour l'upload de photos

### Frontend
- **Angular 17**
- **NGXS** pour la gestion d'etat (Redux pattern)
- **RxJS** pour la programmation reactive
- **TypeScript**

## Fonctionnalites

- Inscription et connexion des utilisateurs (JWT)
- Creation, modification, suppression de pollutions
- Upload de photos pour les pollutions
- Recherche et filtrage des pollutions
- Systeme de favoris (persiste avec NGXS)
- Fiche detaillee pour chaque pollution
- Gestion des statuts (signalee, en cours, resolue)
- Protection des routes avec guards
- Intercepteur HTTP pour le token JWT

## Structure du projet

```
projet_final/
├── api/                    # Backend Node.js/Express
│   ├── config/            # Configuration base de donnees
│   ├── controllers/       # Controleurs API
│   ├── middleware/        # Middleware (auth, upload)
│   ├── models/            # Modeles Sequelize
│   ├── routes/            # Routes Express
│   ├── uploads/           # Dossier pour les photos
│   ├── server.js          # Point d'entree
│   ├── seed.js            # Script de peuplement
│   ├── Dockerfile         # Docker pour l'API
│   └── package.json
│
├── Front/                  # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Composants Angular
│   │   │   ├── guards/        # Guards d'authentification
│   │   │   ├── interceptors/  # HTTP Interceptor
│   │   │   ├── models/        # Interfaces TypeScript
│   │   │   ├── services/      # Services HTTP
│   │   │   └── store/         # Etats NGXS
│   │   └── environments/      # Config environnements
│   ├── Dockerfile         # Docker pour le front
│   └── package.json
│
└── docker-compose.yml     # Orchestration Docker
```

## Installation locale

### Prerequis
- Node.js 18+
- PostgreSQL 15+ (ou Docker)
- npm ou yarn

### Backend

```bash
cd api
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos parametres

# Initialiser la base de donnees avec des donnees de test
npm run seed

# Demarrer le serveur
npm run dev
```

L'API sera disponible sur http://localhost:3000

### Frontend

```bash
cd Front
npm install

# Demarrer le serveur de developpement
npm run dev
```

L'application sera disponible sur http://localhost:4200

### Avec Docker

```bash
# A la racine du projet
docker-compose up -d
```

Services disponibles:
- Frontend: http://localhost:4200
- API: http://localhost:3000
- PostgreSQL: localhost:5432

## Utilisateurs de test

Apres avoir execute `npm run seed` dans le dossier api:

| Email                      | Mot de passe  |
|---------------------------|---------------|
| jean.dupont@email.com     | password123   |
| sophie.martin@email.com   | password123   |
| pierre.bernard@email.com  | password123   |

## Deploiement sur Render.com

### 1. Deployer l'API

1. Creer un nouveau Web Service sur Render
2. Connecter votre repo GitHub
3. Configurer:
   - **Root Directory**: `api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Ajouter les variables d'environnement:
   - `DATABASE_URL`: (URL PostgreSQL fournie par Render)
   - `JWT_SECRET`: (generer une cle secrete)
   - `JWT_REFRESH_SECRET`: (generer une cle secrete)

### 2. Deployer le Frontend

1. Creer un nouveau Web Service sur Render
2. Connecter votre repo GitHub
3. Configurer:
   - **Root Directory**: `Front`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **IMPORTANT**: Modifier `src/environments/environment.prod.ts` avec l'URL de votre API

## API Endpoints

### Authentification
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraichir le token
- `GET /api/auth/profile` - Profil (authentifie)
- `PUT /api/auth/profile` - Modifier profil (authentifie)

### Pollutions
- `GET /api/pollutions` - Liste des pollutions
- `GET /api/pollutions/:id` - Detail d'une pollution
- `POST /api/pollutions` - Creer (authentifie)
- `PUT /api/pollutions/:id` - Modifier (proprietaire)
- `DELETE /api/pollutions/:id` - Supprimer (proprietaire)

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Detail d'un utilisateur

## Licence

Projet academique - CNAM
