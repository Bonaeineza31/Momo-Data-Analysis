const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route to get transactions with optional limit
router.get('/transactions', transactionController.getTransactions);

// Route to get total count of transactions
router.get('/transactions/count', transactionController.getTransactionCount);

// Route to get summary statistics
router.get('/summary', transactionController.getSummary);

module.exports = router;