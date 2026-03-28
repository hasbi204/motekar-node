require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function addWallet(userId, address, name) {
  const [result] = await db.execute(
    'INSERT INTO wallets (user_id, address, name) VALUES (?, ?, ?)',
    [userId, address, name]
  );
  return result;
}

async function getUserWallets(userId) {
  const [rows] = await db.execute(
    'SELECT * FROM wallets WHERE user_id = ?',
    [userId]
  );
  return rows;
}

module.exports = {
  db,
  // addWallet,
  // getUserWallets,
};
