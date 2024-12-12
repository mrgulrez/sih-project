import express from "express";
import { login, sendOtp, verifyOtp } from "../controllers/otpController.js";

const router = express.Router();

// Login Route
router.post("/login/:userType", login);

// Send OTP Route
router.post("/send-otp", sendOtp);

// Verify OTP Route
router.post("/verify-otp", verifyOtp);

export default router;
