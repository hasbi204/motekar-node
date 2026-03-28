require('dotenv').config({ quiet: true });
require('dns').setDefaultResultOrder('ipv4first');
const monitor = require('./monitor');

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION: ' + err.message);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION: ' + err.message);
});

const logger = require('./logger');
const { Telegraf } = require('telegraf');
const { getBalance } = require('./eth');
const bot = new Telegraf(process.env.BOT_TOKEN);

require('./commands/start')(bot);
require('./commands/help')(bot);
require('./commands/lang')(bot);
require('./commands/wallet')(bot);

bot.on('my_chat_member', (ctx) => {
  const new_status = ctx.update.my_chat_member?.new_chat_member?.status;
  const old_status = ctx.update.my_chat_member?.old_chat_member?.status;
  const first_name = ctx.update.my_chat_member?.from?.first_name || 'User';
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

bot.command('testeth', async (ctx) => {
  const address = '0x91Dca37856240E5e1906222ec79278b16420Dc92'; // contoh

  const balance = await getBalance(address);

  ctx.reply(`Balance: ${balance} ETH`);
});

bot.launch();
console.log('Bot starting...');

if (!global.monitorStarted) {
  global.monitorStarted = true;
  setInterval(() => {
    monitor(bot);
  }, 30000);
}
