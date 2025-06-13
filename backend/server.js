import "dotenv/config" // Modern way to load dotenv
import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url" // For __dirname equivalent
import transactionRoutes from "./routes/transactions.js" // Note the .js extension

// __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../public")))

// Use your transaction routes
app.use("/api", transactionRoutes)

// Fallback to index.html for unknown frontend routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
})

// Start server
const PORT = 3000
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`)
})
