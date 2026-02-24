const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { getWarns, clearWarns } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Voir ou supprimer les warns d\'un utilisateur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Utilisateur ciblé').setRequired(true),
    )
    .addBooleanOption(opt =>
      opt.setName('supprimer').setDescription('Supprimer tous les warns de cet utilisateur'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  userPermissions: [PermissionFlagsBits.ModerateMembers],

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const shouldClear = interaction.options.getBoolean('supprimer') || false;

    // Suppression des warns
    if (shouldClear) {
      clearWarns(user.id);
      return interaction.reply({
        content: `🗑️ Tous les warns de **${user.tag}** ont été supprimés.`,
        ephemeral: true,
      });
    }

    // Afficher les warns
    const warns = getWarns(user.id);

    if (warns.length === 0) {
      return interaction.reply({
        content: `✅ **${user.tag}** n'a aucun warn.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Warns de ${user.tag}`)
      .setColor(0xffa500)
      .setDescription(
        warns
          .map((w, i) => `**#${i + 1}** — ${w.reason}\n> Par <@${w.moderator_id}> le ${w.created_at}`)
          .join('\n\n'),
      )
      .setFooter({ text: `Total : ${warns.length} warn(s)` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
