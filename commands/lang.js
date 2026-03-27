const { setUserLang } = require('../storage/users');
const { getLang } = require('../lang');

module.exports = (bot) => {
  bot.command('lang', async (ctx) => {
    const lang = await getLang(ctx.from.id, ctx.from.language_code);
    ctx.reply(lang.choose);
  });

  bot.command('lang_id', async (ctx) => {
    await setUserLang(ctx.from.id, 'id');
    ctx.reply('Bahasa diubah ke Indonesia 🇮🇩');
  });

  bot.command('lang_en', async (ctx) => {
    await setUserLang(ctx.from.id, 'en');
    ctx.reply('Language changed to English 🇺🇸');
  });
};