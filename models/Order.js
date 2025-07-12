// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      title: String,
      price: Number,
      image: String,
    }
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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
