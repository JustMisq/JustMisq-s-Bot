const { startTwitchChecker } = require('../modules/twitchChecker');
const config = require('../config.json');
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,

  execute(client) {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    console.log(`📡 ${client.guilds.cache.size} serveur(s)`);

    // Définir le statut de streaming
    client.user.setActivity(`JustMisq en live sur Twitch`, {
      type: ActivityType.Streaming,
      url: `https://twitch.tv/${config.twitch.channelName}`,
    });

    // Démarrer le checker Twitch
    startTwitchChecker(client);
  },
};
