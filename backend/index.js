const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialisation de l'application
const app = express();

// Middlewares
app.use(cors()); // Autorise ton Frontend React à communiquer avec ce Backend
app.use(express.json()); // Permet de lire les données JSON (formulaires)

// Route de test
app.get('/', (req, res) => {
  res.json({ message: "🚀 Bienvenue sur l'API de la plateforme de formation !" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});