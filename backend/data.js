import "dotenv/config";
import pool from "./db.js";
import parseXMLFile from "./parse-xml.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function insertData() {
  const filePath = path.join(__dirname, "data", "modified-sms.xml");
  const messages = await parseXMLFile(filePath);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50),
      amount INT,
      date TIMESTAMP,
      body TEXT,
      CONSTRAINT unique_transaction UNIQUE (type, amount, date, body)
    );
  `);

  for (const msg of messages) {
    if (msg.date && msg.amount > 0) {
      await pool.query(
        `INSERT INTO transactions (type, amount, date, body)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ON CONSTRAINT unique_transaction DO NOTHING;`,
        [msg.type, msg.amount, new Date(msg.date), msg.body]
      );
    }
  }

  console.log("✅ Data inserted without duplication!");
}

export default insertData;
