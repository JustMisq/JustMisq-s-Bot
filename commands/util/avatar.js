const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Affiche l\'avatar d\'un utilisateur')
    .addUserOption(opt =>
      opt
        .setName('utilisateur')
        .setDescription('Utilisateur (vous par défaut)')
        .setRequired(false),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Voir l\'avatar')
        .setURL(avatarUrl)
        .setStyle(ButtonStyle.Link),
    );

    const embed = new EmbedBuilder()
      .setTitle(`Avatar de ${user.username}`)
      .setImage(avatarUrl)
      .setColor(0x5865f2)
      .setFooter({ text: `ID: ${user.id}` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
