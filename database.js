const Database = require('better-sqlite3');
const path = require('path');

// --- Connexion à la base SQLite ---
const db = new Database(path.join(__dirname, 'bot.db'));

// Activer le mode WAL pour de meilleures performances
db.pragma('journal_mode = WAL');

// --- Création des tables ---
db.exec(`
  CREATE TABLE IF NOT EXISTS warns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS mod_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS twitch_announces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id TEXT UNIQUE NOT NULL,
    announced_at TEXT DEFAULT (datetime('now'))
  );
`);

// --- Fonctions Warns ---

/** Ajouter un warn */
function addWarn(userId, moderatorId, reason) {
  const stmt = db.prepare('INSERT INTO warns (user_id, moderator_id, reason) VALUES (?, ?, ?)');
  return stmt.run(userId, moderatorId, reason);
}

/** Récupérer tous les warns d'un utilisateur */
function getWarns(userId) {
  const stmt = db.prepare('SELECT * FROM warns WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId);
}

/** Supprimer tous les warns d'un utilisateur */
function clearWarns(userId) {
  const stmt = db.prepare('DELETE FROM warns WHERE user_id = ?');
  return stmt.run(userId);
}

// --- Fonctions Mod Logs ---

/** Enregistrer une action de modération */
function addModLog(action, userId, moderatorId, reason) {
  const stmt = db.prepare('INSERT INTO mod_logs (action, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)');
  return stmt.run(action, userId, moderatorId, reason);
}

// --- Fonctions Twitch ---

/** Vérifier si un stream a déjà été annoncé */
function isStreamAnnounced(streamId) {
  const stmt = db.prepare('SELECT id FROM twitch_announces WHERE stream_id = ?');
  return !!stmt.get(streamId);
}

/** Marquer un stream comme annoncé */
function markStreamAnnounced(streamId) {
  const stmt = db.prepare('INSERT OR IGNORE INTO twitch_announces (stream_id) VALUES (?)');
  return stmt.run(streamId);
}

module.exports = {
  db,
  addWarn,
  getWarns,
  clearWarns,
  addModLog,
  isStreamAnnounced,
  markStreamAnnounced,
};
