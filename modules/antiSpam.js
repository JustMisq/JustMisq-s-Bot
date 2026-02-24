const { Collection } = require('discord.js');
const config = require('../config.json');

// Map userId -> [timestamps]
const messageHistory = new Collection();

/**
 * Vérifie si un message est du spam.
 * Retourne true si l'utilisateur dépasse la limite.
 */
function checkSpam(message) {
  // Ignorer les bots et les admins
  if (message.author.bot) return false;
  if (message.member?.permissions.has('Administrator')) return false;

  const { maxMessages, intervalMs } = config.antiSpam;
  const now = Date.now();
  const userId = message.author.id;

  // Récupérer ou créer l'historique
  if (!messageHistory.has(userId)) {
    messageHistory.set(userId, []);
  }

  const timestamps = messageHistory.get(userId);

  // Nettoyer les timestamps expirés
  const filtered = timestamps.filter(t => now - t < intervalMs);
  filtered.push(now);
  messageHistory.set(userId, filtered);

  // Vérifier si la limite est dépassée
  return filtered.length > maxMessages;
}

/**
 * Applique la sanction anti-spam : timeout + suppression des messages récents
 */
async function handleSpam(message) {
  const { muteDurationMs } = config.antiSpam;

  try {
    // Timeout le membre
    await message.member.timeout(muteDurationMs, 'Anti-spam automatique');

    // Supprimer les messages récents de cet utilisateur dans le salon
    const messages = await message.channel.messages.fetch({ limit: 20 });
    const userMessages = messages.filter(m => m.author.id === message.author.id);
    await message.channel.bulkDelete(userMessages);

    // Message d'avertissement
    await message.channel.send({
      content: `⚠️ **${message.author.tag}** a été mute pour spam (${muteDurationMs / 1000}s).`,
    });
  } catch (err) {
    console.error('[AntiSpam] Erreur:', err.message);
  }

  // Reset l'historique
  messageHistory.delete(message.author.id);
}

module.exports = { checkSpam, handleSpam };
