// Placeholder for db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  try {
    console.log(
      "Connecting to MongoDB:",
      process.env.MONGODB_URI?.slice(0, 30) + "...",
    );
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("🔍 Please check:");
    console.error("   1. MongoDB Atlas IP whitelist includes your current IP");
    console.error("   2. Database user credentials are correct");
    console.error("   3. Network connectivity to MongoDB Atlas");
    console.error(
      "⚠️  Server will continue running without database connection",
    );
    console.error("📝 Fix the MongoDB issue and restart the server");

    // Don't exit, let server continue running
    return false;
  }
  return true;
};

module.exports = { connectDB };
