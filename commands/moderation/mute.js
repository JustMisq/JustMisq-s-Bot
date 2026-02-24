const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../modules/modLogs');

// Durées prédéfinies en millisecondes
const DURATIONS = {
  '1m': 60_000,
  '5m': 300_000,
  '10m': 600_000,
  '30m': 1_800_000,
  '1h': 3_600_000,
  '1d': 86_400_000,
  '7d': 604_800_000,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute (timeout) un utilisateur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Utilisateur à mute').setRequired(true),
    )
    .addStringOption(opt =>
      opt
        .setName('durée')
        .setDescription('Durée du mute')
        .setRequired(true)
        .addChoices(
          { name: '1 minute', value: '1m' },
          { name: '5 minutes', value: '5m' },
          { name: '10 minutes', value: '10m' },
          { name: '30 minutes', value: '30m' },
          { name: '1 heure', value: '1h' },
          { name: '1 jour', value: '1d' },
          { name: '7 jours', value: '7d' },
        ),
    )
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du mute'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  userPermissions: [PermissionFlagsBits.ModerateMembers],

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const duration = interaction.options.getString('durée');
    const reason = interaction.options.getString('raison') || 'Aucune raison';

    const member = await interaction.guild.members.fetch(user.id);

    // Vérifier qu'on peut mute ce membre
    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ Je ne peux pas mute cet utilisateur.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Appliquer le timeout
    await member.timeout(DURATIONS[duration], reason);

    // Log de modération
    await sendModLog(interaction.client, {
      action: 'MUTE',
      user,
      moderator: interaction.user,
      reason: `${reason} (Durée : ${duration})`,
    });

    await interaction.reply({
      content: `🔇 **${user.tag}** a été mute pour **${duration}**. Raison : *${reason}*`,
      ephemeral: true,
    });
  },
};
