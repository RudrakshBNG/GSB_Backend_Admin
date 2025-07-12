const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    age: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    goal: { type: String },
    photo: { type: String }, // URL or file path to the uploaded photo
    otp: String,
    otpExpiresAt: Date,
    score: { type: Number, default: 0 },
    flag: { type: String, enum: ["green", "yellow", "red"], default: "red" },
    subscribed: { type: Boolean, default: false },
    lastScoreUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
