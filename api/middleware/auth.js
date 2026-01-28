const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me';

// Middleware pour vérifier le token JWT (Cookie HttpOnly ou Header Authorization)
const authenticateJWT = (req, res, next) => {
  // Priorité 1: Cookie HttpOnly (plus sécurisé)
  // Priorité 2: Header Authorization (rétrocompatibilité)
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Token d\'authentification manquant'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expiré',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({
        error: 'Token invalide'
      });
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = decoded;
    next();
  });
};

// Middleware optionnel - ne bloque pas si pas de token
const optionalAuth = (req, res, next) => {
  // Priorité 1: Cookie HttpOnly
  // Priorité 2: Header Authorization
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
  }

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    }
    next();
  });
};

// Générer un access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Générer un refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Vérifier un refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me');
};

module.exports = {
  authenticateJWT,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
