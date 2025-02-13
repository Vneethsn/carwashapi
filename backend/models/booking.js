import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  paymentMethod: { 
    type: String, 
    enum: ["cod", "upi", "card"], // ✅ Add more options if needed
    required: true 
  }, 
  status: { type: String, default: "Pending" } // Default status
});

export default mongoose.model("Booking", BookingSchema);
