const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../modules/modLogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un utilisateur du serveur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Utilisateur à bannir').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du ban'),
    )
    .addIntegerOption(opt =>
      opt
        .setName('suppression')
        .setDescription('Nombre de jours de messages à supprimer (0-7)')
        .setMinValue(0)
        .setMaxValue(7),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  userPermissions: [PermissionFlagsBits.BanMembers],

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const reason = interaction.options.getString('raison') || 'Aucune raison';
    const deleteMessageDays = interaction.options.getInteger('suppression') || 0;

    // Vérifier qu'on ne ban pas soi-même
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Vous ne pouvez pas vous bannir vous-même !',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Vérifier si l'utilisateur est déjà banni
    const bans = await interaction.guild.bans.fetch();
    if (bans.has(user.id)) {
      return interaction.reply({
        content: `⚠️ **${user.tag}** est déjà banni du serveur.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.guild.members.ban(user.id, {
      reason,
      deleteMessageSeconds: deleteMessageDays * 86400,
    });

    // Log de modération
    await sendModLog(interaction.client, {
      action: 'BAN',
      user,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `🔨 **${user.tag}** a été banni du serveur. Raison : *${reason}*`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
