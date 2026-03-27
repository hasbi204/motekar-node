const id = require('./lang/id');
const en = require('./lang/en');
const { getUserLang } = require('./storage/users');

async function getLang(userId, telegramLang = 'id') {
  const savedLang = await getUserLang(userId);

  let langCode = savedLang || telegramLang;

  if (langCode.startsWith('en')) return en;
  return id;
}

module.exports = { getLang };
