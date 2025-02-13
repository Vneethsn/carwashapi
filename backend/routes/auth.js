import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const router = express.Router();

// ✅ Ensure SECRET_KEY is defined
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.error("⚠️ JWT_SECRET is missing in .env file!");
  process.exit(1); // Exit the server if no secret key is found
}

// ✅ Signup Route (Corrected)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists. Please log in." });
    }

    // ✅ Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save new user to MongoDB
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // ✅ Create JWT Token
    const token = jwt.sign({ id: newUser._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully!", token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// ✅ Login Route (Fixed)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ error: "User not found. Please register first." });
    }

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Invalid credentials. Please try again." });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login. Please try again later." });
  }
});

export default router;
