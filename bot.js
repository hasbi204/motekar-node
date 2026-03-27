const { Telegraf } = require('telegraf');

const bot = new Telegraf('836397615:AAH2Gvo_RkYp6aBl9XsNKgVtx0eAJ2hebxk');

// load commands
require('./commands/start')(bot);
require('./commands/help')(bot);
require('./commands/lang')(bot);

bot.on('text', (ctx) => {
  console.log('MASUK PESAN:', ctx.message.text);
  ctx.reply('Test reply jalan');
});

bot.launch();

console.log('Bot jalan...');
