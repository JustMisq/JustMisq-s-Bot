module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    // On ne traite que les slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.warn(`[Command] Commande inconnue : ${interaction.commandName}`);
      return;
    }

    // ✅ Vérifier les permissions de l'utilisateur
    if (command.userPermissions && command.userPermissions.length > 0) {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      
      // Charger les IDs des rôles staff
      const config = require('../config.json');
      const staffRoleIds = Object.values(config.staffRoles);
      
      // Vérifier si l'utilisateur a un rôle staff
      const hasStaffRole = member.roles.cache.some(role => staffRoleIds.includes(role.id));
      
      // Vérifier les permissions Discord classiques
      const missingPerms = [];
      for (const permission of command.userPermissions) {
        if (!member.permissions.has(permission)) {
          missingPerms.push(permission);
        }
      }

      // Si l'utilisateur n'a pas de rôle staff ET n'a pas les permissions Discord
      if (!hasStaffRole && missingPerms.length > 0) {
        return interaction.reply({
          content: `❌ Vous n'avez pas les permissions pour utiliser cette commande. Il vous manque : **${missingPerms.join(', ')}**`,
          ephemeral: true,
        });
      }
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[Command] Erreur "${interaction.commandName}":`, err);

      const reply = {
        content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
