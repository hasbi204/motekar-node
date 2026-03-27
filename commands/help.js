const { getLang } = require('../lang');

module.exports = (bot) => {
  bot.command('help', async (ctx) => {
    const lang = await getLang(ctx.from.id, ctx.from.language_code);
    ctx.reply(lang.help);
  });
};