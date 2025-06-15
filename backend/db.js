import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
  ssl: {
    rejectUnauthorized: false, // Required by Render
  },
})

export default pool
