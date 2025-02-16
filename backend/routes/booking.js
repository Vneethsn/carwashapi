import express from "express";
import authMiddleware from "../middleware/auth.js";
import Booking from "../models/booking.js";
import sendEmail from "../utils/email.js";

const router = express.Router();

// 🔹 Create a Booking
router.post("/", authMiddleware, async (req, res) => {
  const { service, date, location, paymentMethod } = req.body;

  if (!service || !date || !location || !paymentMethod) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const bookingDate = new Date(date);
  if (bookingDate < new Date()) {
    return res.status(400).json({ error: "Booking date must be in the future" });
  }

  try {
    const booking = new Booking({
      user: req.user.id, // User ID from JWT
      service,
      date: bookingDate,
      location,
      paymentMethod,
    });

    await booking.save();

    // Send confirmation email
    try {
      await sendEmail(
        req.user.email,
        "Booking Confirmation",
        `Your ${service} is booked on ${bookingDate.toLocaleDateString()} at ${location}. Payment Method: ${paymentMethod}`
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    res.status(201).json({ message: "Booking confirmed successfully!", booking });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});

// 🔹 Get User's Bookings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ date: 1 });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// 🔹 Delete a Booking
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to cancel this booking" });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Booking canceled successfully" });
  } catch (error) {
    console.error("Error canceling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
