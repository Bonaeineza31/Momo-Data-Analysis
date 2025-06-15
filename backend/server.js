import "dotenv/config"; // Modern way to load dotenv
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // For __dirname equivalent
import transactionRoutes from "./routes/transactions.js";
import insertData from "./data.js"; // ⬅️ Import the function

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../public")));

// Use your transaction routes
app.use("/api", transactionRoutes);

// ✅ Temporary route to trigger data insert
app.get("/insert-data", async (req, res) => {
  try {
    await insertData(); // insert data from XML
    res.send(" Data inserted into PostgreSQL successfully.");
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).send(" Failed to insert data.");
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
