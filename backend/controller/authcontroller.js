import * as authService from "../services/authservices.js"
import jwt from "jsonwebtoken"

// Ensure you have a JWT_SECRET in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey"

async function registerUser(req, res) {
  const { phoneNumber, password } = req.body
  if (!phoneNumber || !password) {
    return res.status(400).json({ message: "Phone number and password are required" })
  }

  try {
    const user = await authService.register(phoneNumber, password)
    // Generate a token for the newly registered user
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" })
    res.status(201).json({ message: "User registered successfully", token, userId: user.id })
  } catch (error) {
    console.error("Registration error:", error)
    if (error.message === "User already exists") {
      return res.status(409).json({ message: error.message })
    }
    res.status(500).json({ message: "Error registering user" })
  }
}

async function loginUser(req, res) {
  const { phoneNumber, password } = req.body
  if (!phoneNumber || !password) {
    return res.status(400).json({ message: "Phone number and password are required" })
  }

  try {
    const user = await authService.login(phoneNumber, password)
    if (!user) {
      return res.status(401).json({ message: "Invalid phone number or password" })
    }
    // Generate a token for the logged-in user
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" })
    res.status(200).json({ message: "Login successful", token, userId: user.id })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Error logging in" })
  }
}

export { registerUser, loginUser }
