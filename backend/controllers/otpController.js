import User from "../models/IndReg.js";
import AuthReg from "../models/AuthReg.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../utils/emailService.js";

export const login = async (req, res) => {
  const { userType } = req.params; // User type from the route parameter
  const { officialEmail, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ officialEmail });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, officialEmail: user.officialEmail, role: userType },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send OTP to the user's email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    await sendOtpEmail(user.officialEmail, otp); // Send OTP via email

    res
      .status(200)
      .json({ message: "Login successful. OTP sent to email.", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const sendOtp = async (req, res) => {
  const { officialEmail } = req.body;

  try {
    var user = await User.findOne({ officialEmail });

    if(!user) {
        user = await AuthReg.findOne({ officialEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    await sendOtpEmail(user.officialEmail, otp); // Send OTP via email

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { officialEmail, otp } = req.body;

  try {
    var user = await User.findOne({ officialEmail });

    if(!user) {
        user = await AuthReg.findOne({ officialEmail });
    }

    console.log(user);

    if (!user || user.otpExpires < Date.now() || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully.",
      redirectUrl: user.role === "individual" ? `/individual-dashboard/${user.uniqueID}` : `/${user.role}-dashboard`,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
};
