const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    stock: { type: Number, required: true },
    imageUrl: { type: String, required: true }, // Add image logic later if needed
    ingredients: { type: [String], default: [] },
    benefits: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
