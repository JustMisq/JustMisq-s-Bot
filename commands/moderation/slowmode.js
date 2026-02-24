const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Activer/Désactiver le mode lent sur un canal')
    .addIntegerOption(opt =>
      opt
        .setName('secondes')
        .setDescription('Délai en secondes entre les messages (0 = désactiver)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600), // 6 heures max
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  userPermissions: [PermissionFlagsBits.ManageChannels],

  async execute(interaction) {
    const seconds = interaction.options.getInteger('secondes');
    const channel = interaction.channel;

    await channel.setRateLimitPerUser(seconds);

    const statusText = seconds === 0 ? 'désactivé ✅' : `défini à **${seconds}s** ⏱️`;

    await interaction.reply({
      content: `Mode lent du canal #${channel.name} a été ${statusText}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
