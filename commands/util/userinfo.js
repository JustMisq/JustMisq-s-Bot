const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Affiche les informations sur un utilisateur')
    .addUserOption(opt =>
      opt
        .setName('utilisateur')
        .setDescription('Utilisateur à vérifier (vous par défaut)')
        .setRequired(false),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    // Déterminer le statut
    const status = member.presence?.status || 'offline';
    const statusEmoji = {
      online: '🟢',
      idle: '🟡',
      dnd: '🔴',
      offline: '⚫',
    }[status] || '❓';

    // Compter les rôles
    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .first(10)
      .map(role => `<@&${role.id}>`)
      .join(', ') || 'Aucun rôle';

    const embed = new EmbedBuilder()
      .setTitle(`👤 Informations sur ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor(member.displayColor || 0x5865f2)
      .addFields(
        { name: '📛 Pseudo', value: user.username, inline: true },
        { name: '🏷️ Surnom', value: member.nickname || 'Aucun', inline: true },
        { name: `${statusEmoji} Statut`, value: status, inline: true },
        {
          name: '📅 Compte créé le',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`,
          inline: true,
        },
        {
          name: '🎉 A rejoint le',
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`,
          inline: true,
        },
        { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
        { name: '🏷️ Rôles', value: roles, inline: false },
      )
      .setFooter({ text: `ID: ${user.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
