const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../modules/modLogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retirer le mute d\'un utilisateur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Utilisateur à unmute').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison de la suppression du mute'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  userPermissions: [PermissionFlagsBits.ModerateMembers],

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const reason = interaction.options.getString('raison') || 'Aucune raison';

    const member = await interaction.guild.members.fetch(user.id);

    // Vérifier que le membre est mute
    if (!member.communicationDisabledUntil) {
      return interaction.reply({
        content: `⚠️ **${user.tag}** n'est pas mute actuellement.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // Retirer le mute
    await member.disableCommunicationUntil(null, reason);

    // Log de modération
    await sendModLog(interaction.client, {
      action: 'UNMUTE',
      user,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `🔊 **${user.tag}** peut maintenant parler. Raison : *${reason}*`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
