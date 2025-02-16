import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/email.js"; // Email function to send reset link

dotenv.config();
const router = express.Router();

// ✅ Ensure SECRET_KEY is defined
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.error("⚠️ JWT_SECRET is missing in .env file!");
  process.exit(1); // Exit the server if no secret key is found
}

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists. Please log in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully!", token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials. Please try again." });
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login. Please try again later." });
  }
});

// ✅ Forgot Password - Request Reset Link
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Generate password reset token (valid for 15 min)
    const resetToken = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "15m" });

    // Send email with reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    await sendEmail(user.email, "Password Reset Request", `Click here to reset your password: ${resetLink}`);

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// ✅ Reset Password - Update New Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
