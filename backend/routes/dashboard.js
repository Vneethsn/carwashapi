import express from "express";
import authMiddleware from "../middleware/auth.js"; 
import User from "../models/User.js";

const router = express.Router();

// ✅ Protected Dashboard Route
router.get("/", authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select("-password"); // Exclude password
      if (!user) {
          return res.status(404).json({ error: "User  not found." });
      }
      res.json(user);
  } catch (err) {
      console.error("Error fetching user data:", err);
      res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

export default router;