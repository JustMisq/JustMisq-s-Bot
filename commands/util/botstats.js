const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botstats')
    .setDescription('Affiche les statistiques du bot'),

  async execute(interaction) {
    const client = interaction.client;
    const uptime = client.uptime;

    // Convertir l'uptime en format lisible
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor((uptime % 86400000) / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const uptimeText = `${days}j ${hours}h ${minutes}m`;

    // Infos système
    const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
    const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2);
    const memoryPercent = ((usedMemory / totalMemory) * 100).toFixed(2);

    // Infos du bot
    const guilds = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const commands = client.commands.size;

    const embed = new EmbedBuilder()
      .setTitle('📊 Statistiques du Bot')
      .setColor(0x5865f2)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '⏱️ Uptime', value: uptimeText, inline: true },
        { name: '🗂️ Serveurs', value: `${guilds}`, inline: true },
        { name: '👥 Utilisateurs', value: `${users}`, inline: true },
        { name: '⚙️ Commandes', value: `${commands}`, inline: true },
        {
          name: '💾 RAM utilisée',
          value: `${usedMemory}MB / ${totalMemory}MB (${memoryPercent}%)`,
          inline: true,
        },
        {
          name: '💻 Node.js',
          value: process.version,
          inline: true,
        },
        {
          name: '📚 Discord.js',
          value: require('discord.js').version,
          inline: true,
        },
        { name: '🏷️ Ping', value: `${client.ws.ping}ms`, inline: true },
      )
      .setFooter({ text: `Bot depuis ${client.user.createdAt.toLocaleDateString('fr-FR')}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
