const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notifytwitch')
    .setDescription('Les notifications Twitch sont automatiques dans le canal #🎥-twitch'),

  async execute(interaction) {
    await interaction.reply({
      content: `✅ Les notifications Twitch sont postées automatiquement dans <#${config.notifications.twitch}> !`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

// Fonction pour notifier les utilisateurs (à utiliser dans le module twitchChecker)
function notifyStreamStart(client, streamInfo) {
  // Récupérer le canal de notification
  const config = require('../../config.json');
  const channelId = config.notifications.twitch;

  if (!channelId) {
    console.warn('⚠️ ID du canal Twitch non configuré dans config.json');
    return;
  }

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.warn(`⚠️ Canal ${channelId} introuvable`);
    return;
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Aller au stream')
      .setURL(`https://twitch.tv/${config.twitch.channelName}`)
      .setStyle(ButtonStyle.Link),
  );

  channel.send({
    content: `🔴 **${streamInfo.user_name}** est maintenant en live sur Twitch !`,
    components: [row],
  }).catch(err => console.error(`Erreur lors de la notification Twitch: ${err}`));
}

module.exports.notifyStreamStart = notifyStreamStart;
