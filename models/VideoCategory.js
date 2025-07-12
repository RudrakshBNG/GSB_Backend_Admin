const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const videoCategorySchema = new mongoose.Schema({
  categoryId: { type: String, default: uuidv4, unique: true },
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: [3, "Name must be at least 3 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VideoCategory", videoCategorySchema);
