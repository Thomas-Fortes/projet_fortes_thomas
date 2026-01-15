/**
 * Script de peuplement de la base de données avec des données de test
 * Usage: node seed.js
 */

const sequelize = require('./config/database');
const User = require('./models/User');
const Pollution = require('./models/Pollution');

const users = [
  {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    password: 'password123'
  },
  {
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'sophie.martin@email.com',
    password: 'password123'
  },
  {
    nom: 'Bernard',
    prenom: 'Pierre',
    email: 'pierre.bernard@email.com',
    password: 'password123'
  }
];

async function seed() {
  try {
    console.log('Debut du peuplement de la base de données...');

    // Connexion à la base
    await sequelize.authenticate();
    console.log('Connexion établie');

    // Synchronisation (supprime et recrée les tables)
    await sequelize.sync({ force: true });
    console.log('Base de données synchronisée');

    // Création des utilisateurs (avec individualHooks pour hasher les mots de passe)
    console.log('\nCréation des utilisateurs...');
    const createdUsers = await User.bulkCreate(users, { individualHooks: true });
    console.log(`${createdUsers.length} utilisateurs créés`);

    // Création des pollutions
    const pollutions = [
      {
        titre: 'Déversement de déchets plastiques',
        description: 'Grande quantité de déchets plastiques observée sur les berges de la rivière. Situation préoccupante nécessitant une intervention rapide.',
        type: 'plastique',
        localisation: 'Seine, Paris 15ème',
        latitude: 48.8422,
        longitude: 2.2882,
        statut: 'signalee',
        userId: createdUsers[0].id
      },
      {
        titre: 'Fumées industrielles suspectes',
        description: 'Émanations de fumées noires provenant de l\'usine locale. Odeur âcre signalée par plusieurs riverains.',
        type: 'chimique',
        localisation: 'Zone industrielle de Gennevilliers',
        latitude: 48.9333,
        longitude: 2.2833,
        statut: 'en_cours',
        userId: createdUsers[1].id
      },
      {
        titre: 'Dépôt sauvage de gravats',
        description: 'Dépôt illégal de matériaux de construction sur terrain public. Surface estimée à 30m².',
        type: 'dechet',
        localisation: 'Forêt de Fontainebleau',
        latitude: 48.4000,
        longitude: 2.7000,
        statut: 'signalee',
        userId: createdUsers[0].id
      },
      {
        titre: 'Nuisances sonores nocturnes',
        description: 'Bruit excessif provenant d\'un établissement de nuit entre 23h et 5h du matin.',
        type: 'sonore',
        localisation: 'Rue de Rivoli, Paris 1er',
        latitude: 48.8606,
        longitude: 2.3376,
        statut: 'resolue',
        userId: createdUsers[2].id
      },
      {
        titre: 'Pollution lumineuse excessive',
        description: 'Panneaux publicitaires LED très lumineux fonctionnant toute la nuit.',
        type: 'visuelle',
        localisation: 'Avenue des Champs-Élysées, Paris 8ème',
        latitude: 48.8698,
        longitude: 2.3076,
        statut: 'signalee',
        userId: createdUsers[1].id
      },
      {
        titre: 'Déversement d\'huile dans le canal',
        description: 'Trace d\'huile visible sur plusieurs dizaines de mètres dans le canal Saint-Martin.',
        type: 'eau',
        localisation: 'Canal Saint-Martin, Paris 10ème',
        latitude: 48.8722,
        longitude: 2.3643,
        statut: 'en_cours',
        userId: createdUsers[2].id
      },
      {
        titre: 'Sol contaminé aux hydrocarbures',
        description: 'Ancien garage automobile avec sol visiblement pollué. Végétation morte sur la zone.',
        type: 'sol',
        localisation: '42 rue du Commerce, Montreuil',
        latitude: 48.8533,
        longitude: 2.4391,
        statut: 'signalee',
        userId: createdUsers[0].id
      }
    ];

    console.log('\nCréation des pollutions...');
    const createdPollutions = await Pollution.bulkCreate(pollutions);
    console.log(`${createdPollutions.length} pollutions créées`);

    console.log('\n=== Peuplement terminé avec succès! ===');
    console.log('\nUtilisateurs créés:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.prenom} ${user.nom} (${user.email}) - mot de passe: password123`);
    });

    console.log('\nPollutions créées:');
    createdPollutions.forEach(pollution => {
      console.log(`  - ${pollution.titre} [${pollution.statut}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du peuplement:', error);
    process.exit(1);
  }
}

seed();
