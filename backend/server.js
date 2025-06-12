import express from 'express';
import { XMLParser } from 'fast-xml-parser';
import pg from 'pg';

const app = express();
const port = 3000;

// PostgreSQL setup
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'momo', // Replace with your actual database name
  password: 'Gisubizo311', // Replace with your actual password
  port: 5432,
});

// Test the database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL', err));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API endpoint to fetch transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = 'SELECT * FROM transactions';
    const values = [];
    let conditions = [];

    if (search) {
      conditions.push(`body LIKE $${values.length + 1}`);
      values.push(`%${search}%`);
    }

    if (type) {
      conditions.push(`transaction_type = $${values.length + 1}`);
      values.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transactions', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});