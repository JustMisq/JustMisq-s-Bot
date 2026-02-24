const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { addWarn, getWarns } = require('../../database');
const { sendModLog } = require('../../modules/modLogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un utilisateur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Utilisateur à warn').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du warn').setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  userPermissions: [PermissionFlagsBits.ModerateMembers],

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const reason = interaction.options.getString('raison');

    // Ajouter le warn en BDD
    addWarn(user.id, interaction.user.id, reason);

    // Compter les warns
    const warns = getWarns(user.id);

    // Log de modération
    await sendModLog(interaction.client, {
      action: 'WARN',
      user,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `⚠️ **${user.tag}** a été averti. Raison : *${reason}*\n📋 Total warns : **${warns.length}**`,
      ephemeral: true,
    });
  },
};
