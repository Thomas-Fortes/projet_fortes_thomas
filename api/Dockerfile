# Dockerfile pour l'API Node.js/Express
FROM node:18-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le code source
COPY . .

# Créer le dossier uploads
RUN mkdir -p uploads

# Exposer le port
EXPOSE 3000

# Variable d'environnement pour la production
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "server.js"]
