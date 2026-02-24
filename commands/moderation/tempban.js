const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../modules/modLogs');

// Durées prédéfinies en millisecondes
const DURATIONS = {
  '1h': 3_600_000,
  '1d': 86_400_000,
  '3d': 259_200_000,
  '7d': 604_800_000,
  '30d': 2_592_000_000,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Bannir temporairement un utilisateur')
    .addUserOption(opt =>
      opt.setName('utilisateur').setDescription('Utilisateur à bannir').setRequired(true),
    )
    .addStringOption(opt =>
      opt
        .setName('durée')
        .setDescription('Durée du ban temporaire')
        .setRequired(true)
        .addChoices(
          { name: '1 heure', value: '1h' },
          { name: '1 jour', value: '1d' },
          { name: '3 jours', value: '3d' },
          { name: '7 jours', value: '7d' },
          { name: '30 jours', value: '30d' },
        ),
    )
    .addStringOption(opt =>
      opt.setName('raison').setDescription('Raison du ban temporaire'),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  userPermissions: [PermissionFlagsBits.BanMembers],

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur');
    const duration = interaction.options.getString('durée');
    const reason = interaction.options.getString('raison') || 'Aucune raison';

    // Vérifier qu'on ne ban pas soi-même
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Vous ne pouvez pas vous bannir vous-même !',
        ephemeral: true,
      });
    }

    const durationMs = DURATIONS[duration];
    const durationText = `${duration}`;

    // Bannir l'utilisateur
    await interaction.guild.members.ban(user.id, { reason });

    // Log de modération
    await sendModLog(interaction.client, {
      action: 'TEMPBAN',
      user,
      moderator: interaction.user,
      reason: `${reason} (Durée: ${durationText})`,
    });

    // Débannir après la durée définie
    setTimeout(async () => {
      try {
        await interaction.guild.bans.remove(user.id, 'Ban temporaire expiré');
        console.log(`✅ Ban temporaire expiré pour ${user.tag}`);
      } catch (err) {
        console.error(`Erreur lors de la suppression du ban temporaire: ${err}`);
      }
    }, durationMs);

    await interaction.reply({
      content: `🔨 **${user.tag}** a été banni temporairement pour **${durationText}**. Raison : *${reason}*`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
