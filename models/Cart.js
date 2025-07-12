const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [cartItemSchema],
});

module.exports = mongoose.model('Cart', cartSchema); // ✅ Export directly
