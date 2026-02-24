const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Affiche les informations du serveur'),

  async execute(interaction) {
    const guild = interaction.guild;

    // Compter les utilisateurs et les bots
    const members = await guild.members.fetch();
    const users = members.filter(m => !m.user.bot).size;
    const bots = members.filter(m => m.user.bot).size;

    // Compter les rôles, salons, etc.
    const channels = guild.channels.cache;
    const textChannels = channels.filter(ch => ch.isTextBased()).size;
    const voiceChannels = channels.filter(ch => ch.isVoiceBased()).size;

    const embed = new EmbedBuilder()
      .setTitle(`📊 Informations de ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .setColor(0x5865f2)
      .addFields(
        { name: '👥 Membres', value: `${users} utilisateurs • ${bots} bots`, inline: true },
        { name: '👤 Total', value: `${guild.memberCount} membres`, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: true },
        {
          name: '🎯 Niveau de vérification',
          value: guild.verificationLevel.toString(),
          inline: true,
        },
        { name: '⚙️ Salons texte', value: `${textChannels}`, inline: true },
        { name: '🎙️ Salons vocaux', value: `${voiceChannels}`, inline: true },
        { name: '🏷️ Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '💎 Boost', value: `${guild.premiumSubscriptionCount} boost(s)`, inline: true },
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
      )
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
