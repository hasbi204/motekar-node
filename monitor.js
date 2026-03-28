const { getUserWallets, updateBalance } = require('./db');
const { getBalance } = require('./eth');

const ADMIN_ID = process.env.GROUP_ID;

async function monitor(bot) {
  console.log('Monitoring jalan...');

  // ambil semua wallet
  const [wallets] = await require('./db').db.execute('SELECT * FROM wallets');

  for (const w of wallets) {
    try {
      const balance = await getBalance(w.address);

      if (w.last_balance === null || w.last_balance === '0') {
        await updateBalance(w.id, balance);
        continue;
      }

      if (balance !== w.last_balance) {
        const diff = balance - w.last_balance;

        const type = diff > 0 ? '📥 Masuk' : '📤 Keluar';

        await bot.telegram.sendMessage(
          w.user_id,
          `${type}\n${w.name}\n${w.address}\n\nBalance: ${balance} ETH`
        );

        await updateBalance(w.id, balance);
      }
    } catch (err) {
      console.error('Monitor error:', err.message);
    }
  }
}

module.exports = monitor;
