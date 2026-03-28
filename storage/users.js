const { db } = require('../db');

async function setUserLang(userId, lang) {
  await db.execute(
    `INSERT INTO users (id, language)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE language = ?`,
    [userId, lang, lang]
  );
}

async function getUserLang(userId) {
  const [rows] = await db.execute(
    'SELECT language FROM users WHERE id = ?',
    [userId]
  );

  return rows[0]?.language;
}

module.exports = { setUserLang, getUserLang };
