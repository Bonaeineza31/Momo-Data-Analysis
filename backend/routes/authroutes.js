import express from "express"
import * as authController from "../controller/authcontroller.js"

const router = express.Router()

router.post("/register", authController.registerUser)
router.post("/login", authController.loginUser)

export default router
