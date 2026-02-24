const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { isStreamAnnounced, markStreamAnnounced } = require('../database');

let twitchAccessToken = null;
let tokenExpiresAt = 0;

// --- Authentification Twitch (Client Credentials) ---

async function getTwitchToken() {
  // Réutiliser le token s'il est encore valide
  if (twitchAccessToken && Date.now() < tokenExpiresAt) {
    return twitchAccessToken;
  }

  const params = new URLSearchParams({
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    grant_type: 'client_credentials',
  });

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: params,
  });

  if (!res.ok) throw new Error(`Twitch auth failed: ${res.status}`);

  const data = await res.json();
  twitchAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // marge de 60s

  return twitchAccessToken;
}

// --- Récupérer les infos du stream ---

async function getStreamInfo() {
  const token = await getTwitchToken();

  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${config.twitch.channelName}`,
    {
      headers: {
        'Client-ID': config.twitch.clientId,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error(`Twitch API error: ${res.status}`);

  const data = await res.json();
  return data.data?.[0] || null; // null = pas en live
}

// --- Vérification périodique ---

function startTwitchChecker(client) {
  console.log('[Twitch] Checker démarré (toutes les 60s)');

  // Vérifier immédiatement, puis toutes les 60s
  checkStream(client);
  setInterval(() => checkStream(client), 60_000);
}

async function checkStream(client) {
  try {
    const stream = await getStreamInfo();

    if (!stream) return; // Pas en live

    // Vérifier si ce live a déjà été annoncé
    if (isStreamAnnounced(stream.id)) return;

    // Marquer comme annoncé
    markStreamAnnounced(stream.id);

    // Envoyer l'annonce
    const channel = await client.channels.fetch(config.notifications.twitch);
    if (!channel) return;

    const thumbnailUrl = stream.thumbnail_url
      .replace('{width}', '440')
      .replace('{height}', '248');

    const embed = new EmbedBuilder()
      .setTitle(`🔴 ${stream.user_name} est en live !`)
      .setURL(`https://twitch.tv/${config.twitch.channelName}`)
      .setColor(0x9146ff)
      .addFields(
        { name: '🎮 Jeu', value: stream.game_name || 'Non défini', inline: true },
        { name: '👀 Viewers', value: `${stream.viewer_count}`, inline: true },
      )
      .setDescription(stream.title || 'Pas de titre')
      .setImage(thumbnailUrl + `?t=${Date.now()}`) // cache-bust
      .setTimestamp();

    await channel.send({
      content: '🎬 **Le stream est en live ! Venez regarder !**',
      embeds: [embed],
    });

    console.log(`[Twitch] Live annoncé: ${stream.title}`);
  } catch (err) {
    console.error('[Twitch] Erreur check stream:', err.message);
  }
}

module.exports = { startTwitchChecker, getStreamInfo };
