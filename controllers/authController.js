const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const client = require("../config/twilio");

// const HARDCODED_EMAIL = 'admin@gsbpathy.com';
// const HARDCODED_PASSWORD = 'gsbpathy123';

// exports.loginAdmin = async (req, res) => {
//   const { email, password } = req.body;
//   console.log("Login attempt:", email, password);

//   try {
//     if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
//       console.log("Invalid credentials");
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }
//     const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     console.log("Token created:", token);
//     res.status(200).json({ token });
//   } catch (err) {
//     console.error("Server Error:", err);
//     res.status(500).json({ message: 'Server Error', error: err.message });
//   }
// };

const TeamMember = require("../models/TeamMember");

const SUPER_ADMIN_EMAIL = "admin@gsbpathy.com";
const SUPER_ADMIN_PASSWORD = "gsbpathy123";

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);

  try {
    // 1. Check Super Admin
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, role: "super-admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({ token });
    }

    // 2. Check Team Member login
    const user = await TeamMember.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email, role: "team" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({ token });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.sendOTP = async (req, res) => {
  const { fullName, phoneNumber } = req.body;

  console.log("➡️ Received request to send OTP");
  console.log("📨 Request Body:", req.body);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now

  try {
    let user = await User.findOne({ phoneNumber });

    console.log("🔍 User found:", user);

    if (!user) {
      console.log("🆕 Creating new user");
      user = new User({ fullName, phoneNumber, otp, otpExpiresAt });
    } else {
      console.log("🔁 Updating existing user's OTP");
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
    }

    await user.save();
    console.log("💾 User saved with OTP:", otp);

    // Sending the OTP via Twilio
    const twilioResponse = await client.messages.create({
      body: `Your GSB Pathy verification code is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber,
    });

    console.log("📤 Twilio message sent:", twilioResponse.sid);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error occurred while sending OTP:", error);

    // Respond with detailed error for development (limit in production)
    res.status(500).json({ error: "Failed to send OTP", debug: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Generate JWT token for user
    const token = jwt.sign(
      {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        score: user.score,
        flag: user.flag,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "OTP verification failed" });
  }
};

// User login with phone number and OTP
exports.loginUser = async (req, res) => {
  const { fullName, phoneNumber } = req.body;

  console.log("➡️ User login attempt");
  console.log("📨 Request Body:", req.body);

  if (!fullName || !phoneNumber) {
    return res
      .status(400)
      .json({ error: "Full name and phone number are required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now

  try {
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please register first." });
    }

    // Update user's full name if provided and different
    if (fullName !== user.fullName) {
      user.fullName = fullName;
    }

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    console.log("💾 User updated with OTP:", otp);

    // Send OTP via Twilio
    const twilioResponse = await client.messages.create({
      body: `Your GSB login verification code is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber,
    });

    console.log("📤 Twilio message sent:", twilioResponse.sid);

    res.status(200).json({ message: "OTP sent successfully for login" });
  } catch (error) {
    console.error("❌ Error occurred during login:", error);
    res
      .status(500)
      .json({ error: "Failed to send login OTP", debug: error.message });
  }
};
