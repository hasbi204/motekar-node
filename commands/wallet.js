const { addWallet } = require('../db');
const { getUserWallets } = require('../db');

module.exports = (bot) => {
  bot.command('addwallet', async (ctx) => {
    try {
      const text = ctx.message.text.split(' ');
      if (text.length < 3) {
        return ctx.reply('Format:\n/addwallet nama address');
      }
      const name = text[1];
      const address = text[2];
      const userId = ctx.from.id;
      await addWallet(userId, address, name);
      ctx.reply(`✅ Wallet berhasil ditambahkan:\n${name}\n${address}`);
    } catch (err) {
      console.error(err);
      ctx.reply('❌ Gagal menambahkan wallet');
    }
  });

  bot.command('listwallet', async (ctx) => {
    const userId = ctx.from.id;
    const wallets = await getUserWallets(userId);
    if (wallets.length === 0) {
      return ctx.reply('❌ Kamu belum punya wallet');
    }
    let text = '📌 Wallet kamu:\n\n';
    wallets.forEach((w, i) => {
      text += `${i + 1}. ${w.name}\n${w.address}\n\n`;
    });
    ctx.reply(text);
  });
};
