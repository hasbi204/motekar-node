const { setUserLang } = require('../storage/users');
const { getLang } = require('../lang');
const { Markup } = require('telegraf');

module.exports = (bot) => {
  bot.command('lang', async (ctx) => {
    const lang = await getLang(ctx.from.id, ctx.from.language_code);
    ctx.reply(lang.choose_lang,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(lang.button_id, 'lang_id'),
          Markup.button.callback(lang.button_en, 'lang_en'),
        ],
      ])
    );
  });

  bot.action('lang_id', async (ctx) => {
    await setUserLang(ctx.from.id, 'id');
    const lang = await getLang(ctx.from.id, 'id');
    await ctx.answerCbQuery(lang.answer_choose_lang);
    await ctx.editMessageText(lang.choose_lang,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(lang.button_id, 'lang_id'),
          Markup.button.callback(lang.button_en, 'lang_en'),
        ],
      ])
    );
  });
  bot.action('lang_en', async (ctx) => {
    await setUserLang(ctx.from.id, 'en');
    const lang = await getLang(ctx.from.id, 'en');
    await ctx.answerCbQuery(lang.answer_choose_lang);
    await ctx.editMessageText(lang.choose_lang,
      Markup.inlineKeyboard([
        [
          Markup.button.callback(lang.button_id, 'lang_id'),
          Markup.button.callback(lang.button_en, 'lang_en'),
        ],
      ])
    );
  });
};
