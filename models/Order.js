// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      image: String,
    },
  ],
  contactInfo: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    city: String,
    state: String,
  },
  paymentMethod: String,
  total: Number,
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  trackingNumber: String,
  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      notes: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
