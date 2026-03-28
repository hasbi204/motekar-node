const { addWallet } = require('../db');

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
};
