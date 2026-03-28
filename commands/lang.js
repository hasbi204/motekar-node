const { setUserLang } = require('../storage/users');
const { getLang } = require('../lang');
const { Markup } = require('telegraf');

module.exports = (bot) => {
  bot.command('lang', async (ctx) => {
    const lang = await getLang(ctx.from.id, ctx.from.language_code);
    ctx.reply(lang.choose,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🇮🇩 Indonesia', 'lang_id'),
          Markup.button.callback('🇺🇸 English', 'lang_en'),
        ],
      ])
    );
  });

  bot.action('lang_id', async (ctx) => {
    await setUserLang(ctx.from.id, 'id');
    const lang = await getLang(ctx.from.id, 'id');
    await ctx.editMessageText(
      lang.choose,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🇮🇩 Indonesia', 'lang_id'),
          Markup.button.callback('🇺🇸 English', 'lang_en'),
        ],
      ])
    );
  });

  bot.action('lang_en', async (ctx) => {
    await setUserLang(ctx.from.id, 'en');
    const lang = await getLang(ctx.from.id, 'en');
    await ctx.editMessageText(
      lang.choose,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('🇮🇩 Indonesian', 'lang_id'),
          Markup.button.callback('🇺🇸 English', 'lang_en'),
        ],
      ])
    );
  });
};