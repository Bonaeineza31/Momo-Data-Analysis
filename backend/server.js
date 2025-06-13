const express = require('express');
const cors = require('cors');
const path = require('path');
const transactionRoutes = require('./routes/transactionRoutes'); // Import your new routes

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// Use your transaction routes
app.use('/api', transactionRoutes); // All transaction-related routes will start with /api

// Fallback to index.html for unknown frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});