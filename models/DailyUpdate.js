const mongoose = require("mongoose");

const DailyUpdateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    minlength: [3, "Title must be at least 3 characters long"],
    maxlength: [100, "Title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  imageUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v);
      },
      message: "Invalid URL format for imageUrl",
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient sorting by createdAt
DailyUpdateSchema.index({ createdAt: -1 });

module.exports = mongoose.model("DailyUpdate", DailyUpdateSchema);
