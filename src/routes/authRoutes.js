import { Router } from "express"
import { forgotPassword, login, register, resetPassword, verifyOtp } from "../controllers/authController.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtp)
router.post("/reset-password", resetPassword)

export default router
