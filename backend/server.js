// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'momo',
  password: 'newpassword',
  port: 5432,
});

// API: Get all transactions (limit for performance)
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('DB fetch error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
// API: Get transactions with optional limit
app.get('/api/transactions', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    
    let query = 'SELECT * FROM transactions ORDER BY date DESC';
    if (limit && !isNaN(limit) && limit > 0) {
      query += ` LIMIT ${limit}`;
    }
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('DB fetch error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get total count of transactions
app.get('/api/transactions/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM transactions');
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (err) {
    console.error('DB count error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Add a new endpoint for summary statistics
app.get('/api/summary', async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) as total FROM transactions');
    const sumResult = await pool.query('SELECT SUM(amount) as total_amount FROM transactions');
    const incomingResult = await pool.query("SELECT SUM(amount) as incoming FROM transactions WHERE type IN ('deposit', 'incoming')");
    const outgoingResult = await pool.query("SELECT SUM(amount) as outgoing FROM transactions WHERE type NOT IN ('deposit', 'incoming')");
    
    res.json({
      count: parseInt(countResult.rows[0].total),
      total: parseInt(sumResult.rows[0].total_amount) || 0,
      incoming: parseInt(incomingResult.rows[0].incoming) || 0,
      outgoing: parseInt(outgoingResult.rows[0].outgoing) || 0
    });
  } catch (err) {
    console.error('DB summary error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Fallback to index.html for unknown frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
