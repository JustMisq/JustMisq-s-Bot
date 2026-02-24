const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../modules/modLogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulser un utilisateur du serveur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Utilisateur à expulser').setRequired(true),
    )
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison de l\'expulsion'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  userPermissions: [PermissionFlagsBits.KickMembers],

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const reason = interaction.options.getString('raison') || 'Aucune raison';

    const member = await interaction.guild.members.fetch(user.id);

    // Vérifier qu'on peut kick ce membre
    if (!member.kickable) {
      return interaction.reply({
        content: `❌ Je ne peux pas expulser **${user.tag}** (rôle trop élevé ou permissions insuffisantes).`,
        ephemeral: true,
      });
    }

    // Vérifier qu'on ne kick pas soi-même
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Vous ne pouvez pas vous expulser vous-même !',
        ephemeral: true,
      });
    }

    await member.kick(reason);

    // Log de modération
    await sendModLog(interaction.client, {
      action: 'KICK',
      user,
      moderator: interaction.user,
      reason,
    });

    await interaction.reply({
      content: `👢 **${user.tag}** a été expulsé du serveur. Raison : *${reason}*`,
      ephemeral: true,
    });
  },
};
