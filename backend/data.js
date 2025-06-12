// backend/insert.js
const pool = require('./db');
const parseXMLFile = require('./parse-xml');

async function insertData() {
 const messages = await parseXMLFile(__dirname + '/data/modified-sms.xml');


  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50),
      amount INT,
      date TIMESTAMP,
      body TEXT
    );
  `);

  for (const msg of messages) {
    if (msg.date && msg.amount > 0) {
      await pool.query(
        `INSERT INTO transactions (type, amount, date, body) VALUES ($1, $2, $3, $4)`,
        [msg.type, msg.amount, msg.date, msg.body]
      );
    }
  }

  console.log(' Data inserted successfully!');
  process.exit();
}

insertData();
