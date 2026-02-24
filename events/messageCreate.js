const { checkSpam, handleSpam } = require('../modules/antiSpam');

module.exports = {
  name: 'messageCreate',

  async execute(message) {
    // Ignorer les bots
    if (message.author.bot) return;

    // Anti-spam
    if (checkSpam(message)) {
      await handleSpam(message);
    }
  },
};
