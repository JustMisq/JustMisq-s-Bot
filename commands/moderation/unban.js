const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../modules/modLogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannir un utilisateur')
    .addStringOption(opt =>
      opt.setName('userid').setDescription('ID de l\'utilisateur à débannir').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du débannissement'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  userPermissions: [PermissionFlagsBits.BanMembers],

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('raison') || 'Aucune raison';

    // Vérifier si l'utilisateur est banni
    const bans = await interaction.guild.bans.fetch();
    const ban = bans.get(userId);

    if (!ban) {
      return interaction.reply({
        content: `⚠️ L'utilisateur avec l'ID **${userId}** n'est pas banni du serveur.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.guild.bans.remove(userId, reason);

    // Log de modération
    await sendModLog(interaction.client, {
      action: 'UNBAN',
      user: { tag: ban.user.tag, id: userId },
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `✅ **${ban.user.tag}** a été débanni du serveur. Raison : *${reason}*`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
