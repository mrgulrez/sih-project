import express from "express";
import { verifyRole } from "../controllers/accessMiddleware.js";  // Import the middleware

const router = express.Router();

// Example of an admin-only route
router.get("/admin", verifyRole(["admin"]), (req, res) => {
    console.log("okk")
  res.status(200).json({ message: "Welcome to the admin dashboard" });
});

// Protected route for issuing auth only
router.get("/issuing-auth-dashboard", verifyRole(["issuing-auth", "admin"]), (req, res) => {
    res.status(200).json({ message: "Welcome to the issuing authority dashboard" });
  });

export default router;
