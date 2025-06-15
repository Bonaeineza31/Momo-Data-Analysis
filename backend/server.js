import "dotenv/config"; // Modern way to load dotenv
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // For __dirname equivalent
import transactionRoutes from "./routes/transactions.js";
import insertData from "./data.js"; // ⬅️ Import the function
import authRoutes from "./routes/authroutes.js" // New: Import auth routes
import authMiddleware from "./middlewares/authmidlleware.js" // New: Import auth middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../public")));

// Use your transaction routes
app.use("/api", transactionRoutes);
app.use("/api/auth", authRoutes)

// New: Apply authentication middleware to transaction routes
// All routes under /api/transactions will now require a valid token
app.use("/api", authMiddleware) // Apply to all /api routes after auth

// ✅ Temporary route to trigger data insert
app.get("/insert-data", async (req, res) => {
  try {
    await insertData();
    res.send("✅ Data inserted into PostgreSQL successfully.");
  } catch (err) {
    console.error("Insert error:", err); // already exists
    res.status(500).send(`❌ Failed to insert data: ${err.message}`);
  }
});


// Fallback to index.html for unknown frontend routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
