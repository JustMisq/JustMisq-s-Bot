const express = require('express');
const app = express();

module.exports = function startWebServer() {
  // Route simple pour keepalive
  app.get('/', (req, res) => {
    res.send('🤖 Bot alive!');
  });

  // Route pour vérifier le statut
  app.get('/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date() });
  });

  // Port Render
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
  });
};
