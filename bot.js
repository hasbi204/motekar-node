require('dotenv').config();
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

bot.launch();

console.log('Bot starting...');
logger.info('Bot starting...');
