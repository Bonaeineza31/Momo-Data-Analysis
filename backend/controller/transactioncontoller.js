import * as transactionService from "../services/transactionservices.js"

async function getTransactions(req, res) {
  try {
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : null
    const transactions = await transactionService.fetchTransactions(limit)
    res.json(transactions)
  } catch (err) {
    console.error("Controller error fetching transactions:", err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

async function getTransactionCount(req, res) {
  try {
    const count = await transactionService.fetchTransactionCount()
    res.json({ total: count })
  } catch (err) {
    console.error("Controller error fetching transaction count:", err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

async function getSummary(req, res) {
  try {
    const summary = await transactionService.fetchSummary()
    res.json(summary)
  } catch (err) {
    console.error("Controller error fetching summary:", err)
    res.status(500).json({ error: "Something went wrong" })
  }
}

export {
  // Use named exports
  getTransactions,
  getTransactionCount,
  getSummary,
}
