const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    try {
      const channel = await member.client.channels.fetch(config.channels.welcome);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle('👋 Bienvenue !')
        .setDescription(
          `Bienvenue sur le serveur, ${member} !\n` +
          `Tu es le **${member.guild.memberCount}ème** membre.`,
        )
        .setColor(0x2ecc71)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('[Welcome] Erreur:', err.message);
    }
  },
};
