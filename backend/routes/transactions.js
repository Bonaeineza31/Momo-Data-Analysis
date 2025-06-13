import express from "express"
import * as transactionController from "../controller/transactioncontoller.js" // Import all exports

const router = express.Router()

// Route to get transactions with optional limit
router.get("/transactions", transactionController.getTransactions)

// Route to get total count of transactions
router.get("/transactions/count", transactionController.getTransactionCount)

// Route to get summary statistics
router.get("/summary", transactionController.getSummary)

export default router // Use default export for the router
