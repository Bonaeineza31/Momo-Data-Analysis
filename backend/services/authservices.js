import pool from "../db.js"
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

async function register(phoneNumber, password) {
  const client = await pool.connect()
  try {
    // Check if user already exists
    const existingUser = await client.query("SELECT * FROM users WHERE phone_number = $1", [phoneNumber])
    if (existingUser.rows.length > 0) {
      throw new Error("User already exists")
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const result = await client.query(
      "INSERT INTO users (phone_number, password_hash) VALUES ($1, $2) RETURNING id, phone_number",
      [phoneNumber, passwordHash],
    )
    return result.rows[0]
  } finally {
    client.release()
  }
}

async function login(phoneNumber, password) {
  const client = await pool.connect()
  try {
    const result = await client.query("SELECT * FROM users WHERE phone_number = $1", [phoneNumber])
    const user = result.rows[0]

    if (!user) {
      return null // User not found
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return null // Invalid password
    }

    return user // Login successful
  } finally {
    client.release()
  }
}

export { register, login }
