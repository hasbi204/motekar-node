require('dotenv').config({ quiet: true });
require('dns').setDefaultResultOrder('ipv4first');

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION: ' + err.message);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION: ' + err.message);
});

const logger = require('./logger');
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

require('./commands/start')(bot);
require('./commands/help')(bot);
require('./commands/lang')(bot);

bot.on('my_chat_member', (ctx) => {
  const new_status = ctx.update.my_chat_member.new_chat_member.status;
  const old_status = ctx.update.my_chat_member.old_chat_member.status;
  const first_name = ctx.update.my_chat_member.from.first_name;
  if (new_status === 'kicked') {
    ctx.telegram.sendMessage(process.env.GROUP_ID, `🚫 ${first_name} telah memblokir bot.`);
  } else if (old_status === 'kicked' && new_status === 'member') {
    ctx.telegram.sendMessage(process.env.GROUP_ID, `✅ ${first_name} telah membuka blokir bot.`);
  }
});

bot.catch((err, ctx) => {
  if (err.description?.includes('bot was blocked')) {
    ctx.telegram.sendMessage(process.env.GROUP_ID, `❌ User blok bot (fallback): ${ctx.from.id}`);
  }
});

bot.launch();

console.log('Bot starting...');
logger.info('Bot starting...');
