const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Pollution = sequelize.define('Pollution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le titre est requis'
      },
      len: {
        args: [3, 200],
        msg: 'Le titre doit contenir entre 3 et 200 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La description est requise'
      },
      len: {
        args: [10, 5000],
        msg: 'La description doit contenir entre 10 et 5000 caractères'
      }
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le type de pollution est requis'
      },
      isIn: {
        args: [['plastique', 'chimique', 'sonore', 'visuelle', 'eau', 'air', 'sol', 'dechet', 'autre']],
        msg: 'Type de pollution invalide'
      }
    },
    comment: 'Type de pollution: plastique, chimique, sonore, visuelle, eau, air, sol, dechet, autre'
  },
  localisation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La localisation est requise'
      }
    }
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: {
        args: [-90],
        msg: 'La latitude doit être entre -90 et 90'
      },
      max: {
        args: [90],
        msg: 'La latitude doit être entre -90 et 90'
      }
    }
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: {
        args: [-180],
        msg: 'La longitude doit être entre -180 et 180'
      },
      max: {
        args: [180],
        msg: 'La longitude doit être entre -180 et 180'
      }
    }
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Chemin vers la photo de la pollution'
  },
  statut: {
    type: DataTypes.STRING,
    defaultValue: 'signalee',
    validate: {
      isIn: {
        args: [['signalee', 'en_cours', 'resolue']],
        msg: 'Statut invalide'
      }
    },
    comment: 'Statut: signalee, en_cours, resolue'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'pollutions',
  timestamps: true
});

// Définir les relations
Pollution.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Pollution, { foreignKey: 'userId', as: 'pollutions' });

module.exports = Pollution;
