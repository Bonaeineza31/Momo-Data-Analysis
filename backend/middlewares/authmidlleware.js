import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey" // Use the same secret as in authController

function authMiddleware(req, res, next) {
  // Allow auth routes to pass without token
  if (req.path.startsWith("/auth")) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" })
  }

  const token = authHeader.split(" ")[1] // Expects "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ message: "Token missing" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId // Attach userId to the request
    next()
  } catch (error) {
    console.error("Token verification failed:", error)
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

export default authMiddleware
