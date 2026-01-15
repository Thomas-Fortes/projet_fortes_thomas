# Dockerfile pour le Frontend Angular
# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de production
RUN npm run build

# Stage 2: Serve avec un serveur Node.js léger
FROM node:18-alpine

WORKDIR /app

# Copier le fichier server.js et les dépendances
COPY package*.json ./
COPY server.js ./

# Installer uniquement express pour servir les fichiers statiques
RUN npm install express

# Copier le build depuis le stage précédent
COPY --from=build /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
