import pool from "../db.js" // Import the default export

async function fetchTransactions(limit) {
  let query = "SELECT * FROM transactions ORDER BY date DESC"
  if (limit && !isNaN(limit) && limit > 0) {
    query += ` LIMIT ${limit}`
  }
  const result = await pool.query(query)
  return result.rows
}

async function fetchTransactionCount() {
  const result = await pool.query("SELECT COUNT(*) as total FROM transactions")
  return Number.parseInt(result.rows[0].total)
}

async function fetchSummary() {
  const countResult = await pool.query("SELECT COUNT(*) as total FROM transactions")
  const sumResult = await pool.query("SELECT SUM(amount) as total_amount FROM transactions")
  const incomingResult = await pool.query(
    "SELECT SUM(amount) as incoming FROM transactions WHERE type IN ('deposit', 'incoming')",
  )
  const outgoingResult = await pool.query(
    "SELECT SUM(amount) as outgoing FROM transactions WHERE type NOT IN ('deposit', 'incoming')",
  )

  return {
    count: Number.parseInt(countResult.rows[0].total),
    total: Number.parseInt(sumResult.rows[0].total_amount) || 0,
    incoming: Number.parseInt(incomingResult.rows[0].incoming) || 0,
    outgoing: Number.parseInt(outgoingResult.rows[0].outgoing) || 0,
  }
}

// THIS IS THE CRUCIAL LINE: Now fetchTransactions is included!
export { fetchTransactionCount, fetchSummary,fetchTransactions }
