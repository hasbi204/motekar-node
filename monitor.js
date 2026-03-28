const {
  getUserWallets,
  updateBalance,
  updateLastTx,
  updateLastTokenTx,
  updateLastInternalTx,
} = require('./db');

const {
  getNormalTx,
  getTokenTx,
  getInternalTx,
} = require('./etherscan');

const { getBalance } = require('./eth');

const ADMIN_ID = process.env.GROUP_ID;

async function monitor(bot) {
  console.log('Monitoring jalan...');

  // ambil semua wallet
  const [wallets] = await require('./db').db.execute('SELECT * FROM wallets');

  for (const w of wallets) {
    try {
      const txs = await getNormalTx(w.address);
      if (!txs || txs.length === 0) { continue;}
      const latestTx = txs[0];

      if (!w.last_tx_hash) {
        await updateLastTx(w.id, latestTx.hash);
        continue;
      }

      if (latestTx.hash !== w.last_tx_hash) {
        const isIncoming = latestTx.to.toLowerCase() === w.address.toLowerCase();
        const type = isIncoming ? '📥 ETH Masuk' : '📤 ETH Keluar';
        const amount = latestTx.value / 1e18;
        await bot.telegram.sendMessage(w.user_id, JSON.stringify(txs));
//         await bot.telegram.sendMessage(w.user_id,
//     `${type}
// ${w.name}
// ${w.address}

// Amount: ${amount} ETH
// Tx: https://etherscan.io/tx/${latestTx.hash}`
//   );

        
  await updateLastTx(w.id, latestTx.hash);
}

    } catch (err) {
      console.error('Monitor error:', err.message);
    }
  }
}

module.exports = monitor;
