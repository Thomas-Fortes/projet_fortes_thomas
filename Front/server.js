const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques du dossier dist
app.use(express.static(path.join(__dirname, 'dist/tp04-pollution-front')));

// Toutes les routes redirigent vers index.html (pour le routing Angular)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/tp04-pollution-front/index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
