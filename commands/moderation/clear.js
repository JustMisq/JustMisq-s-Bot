const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../modules/modLogs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer des messages dans le salon')
    .addIntegerOption(opt =>
      opt
        .setName('nombre')
        .setDescription('Nombre de messages à supprimer (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    )
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Filtrer par utilisateur (optionnel)'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  userPermissions: [PermissionFlagsBits.ManageMessages],

  async execute(interaction) {
    const amount = interaction.options.getInteger('nombre');
    const targetUser = interaction.options.getUser('utilisateur');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      let deleted;

      if (targetUser) {
        // Récupérer puis filtrer les messages de l'utilisateur ciblé
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const filtered = messages
          .filter(m => m.author.id === targetUser.id)
          .first(amount);
        deleted = await interaction.channel.bulkDelete(filtered, true);
      } else {
        deleted = await interaction.channel.bulkDelete(amount, true);
      }

      // Log de modération
      await sendModLog(interaction.client, {
        action: 'CLEAR',
        user: targetUser || interaction.user,
        moderator: interaction.user,
        reason: `${deleted.size} message(s) supprimé(s) dans #${interaction.channel.name}`,
      });

      await interaction.editReply({
        content: `🗑️ **${deleted.size}** message(s) supprimé(s).`,
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ Erreur : ${err.message}`,
      });
    }
  },
};
