const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'pD@!MYMuT2r2dbK',
  database: 'motekardata',
});

module.exports = db;
