const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    // Easebuzz specific fields
    easebuzzPaymentId: { type: String },
    bankRefNum: { type: String },
    paymentMode: { type: String },
    failureReason: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundDate: { type: Date },
    subscriptionType: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      required: true,
    },
    source: { type: String, enum: ["app", "web", "manual"], default: "app" },
    paymentType: {
      type: String,
      enum: ["subscription", "product"],
      required: true,
      default: "subscription",
    },
    description: { type: String },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
