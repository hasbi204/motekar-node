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

async function deleteWallet(id, userId) {
  const [result] = await db.execute(
    'DELETE FROM wallets WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result;
}

async function updateBalance(walletId, balance) {
  await db.execute(
    'UPDATE wallets SET last_balance = ? WHERE id = ?',
    [balance, walletId]
  );
}

async function updateLastTx(walletId, hash) {
  await db.execute(
    'UPDATE wallets SET last_tx_hash = ? WHERE id = ?',
    [hash, walletId]
  );
}

async function updateLastTokenTx(walletId, hash) {
  await db.execute(
    'UPDATE wallets SET last_token_tx_hash = ? WHERE id = ?',
    [hash, walletId]
  );
}

async function updateLastInternalTx(walletId, hash) {
  await db.execute(
    'UPDATE wallets SET last_internal_tx_hash = ? WHERE id = ?',
    [hash, walletId]
  );
}

module.exports = {
  db,
  addWallet,
  getUserWallets,
  deleteWallet,
  updateBalance,
  updateLastTx,
  updateLastTokenTx,
  updateLastInternalTx,
};
