import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Ensure these are set in .env
    pass: process.env.EMAIL_PASS, // Use an App Password if 2FA is enabled
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sparkle Car Wash" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    // console.error("❌ Error sending email:", error.message);
  }
};

export default sendEmail;
