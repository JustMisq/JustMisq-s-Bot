const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { addModLog } = require('../database');

/**
 * Envoie un embed de log dans le salon de modération
 * et enregistre l'action en base de données.
 */
async function sendModLog(client, { action, user, moderator, reason }) {
  // Enregistrer en BDD
  addModLog(action, user.id, moderator.id, reason || 'Aucune raison');

  // Construire l'embed
  const colors = {
    WARN: 0xffa500,
    MUTE: 0xff6347,
    CLEAR: 0x3498db,
    UNMUTE: 0x2ecc71,
  };

  const embed = new EmbedBuilder()
    .setTitle(`🔨 ${action}`)
    .setColor(colors[action] || 0x95a5a6)
    .addFields(
      { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
      { name: 'Modérateur', value: `${moderator.tag}`, inline: true },
      { name: 'Raison', value: reason || 'Aucune raison' },
    )
    .setTimestamp();

  // Envoyer dans le salon de logs
  try {
    const channel = await client.channels.fetch(config.channels.modLogs);
    if (channel) await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[ModLogs] Erreur envoi log:', err.message);
  }
}

module.exports = { sendModLog };
