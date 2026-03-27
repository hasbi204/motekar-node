const { getLang } = require('../lang');

module.exports = (bot) => {
  bot.start(async (ctx) => {
    const lang = await getLang(ctx.from.id, ctx.from.language_code);
    const name = ctx.from.first_name || 'User';
    ctx.reply(`${lang.welcome}\n\nHalo ${name} 👋`);
  });
};
