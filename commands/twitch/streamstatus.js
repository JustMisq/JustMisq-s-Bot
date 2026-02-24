const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStreamInfo } = require('../../modules/twitchChecker');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('streamstatus')
    .setDescription(`Vérifie si ${config.twitch.channelName} est en live`),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const stream = await getStreamInfo();

      if (!stream) {
        return interaction.editReply({
          content: `📴 **${config.twitch.channelName}** n'est pas en live actuellement.`,
        });
      }

      const thumbnailUrl = stream.thumbnail_url
        .replace('{width}', '440')
        .replace('{height}', '248');

      const embed = new EmbedBuilder()
        .setTitle(`🔴 ${stream.user_name} est en live !`)
        .setURL(`https://twitch.tv/${config.twitch.channelName}`)
        .setColor(0x9146ff)
        .setDescription(stream.title || 'Pas de titre')
        .addFields(
          { name: '🎮 Jeu', value: stream.game_name || 'Non défini', inline: true },
          { name: '👀 Viewers', value: `${stream.viewer_count}`, inline: true },
          { name: '⏱️ Uptime', value: getUptime(stream.started_at), inline: true },
        )
        .setImage(thumbnailUrl + `?t=${Date.now()}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({
        content: `❌ Erreur lors de la vérification : ${err.message}`,
      });
    }
  },
};

/** Calcule le temps écoulé depuis le début du stream */
function getUptime(startedAt) {
  const diff = Date.now() - new Date(startedAt).getTime();
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
