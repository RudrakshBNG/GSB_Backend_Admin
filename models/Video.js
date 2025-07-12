const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
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
  videoUrl: {
    type: String,
    match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "Invalid URL format for videoUrl"],
  },
  thumbnailUrl: {
    type: String,
    match: [
      /^https?:\/\/[^\s$.?#].[^\s]*$/,
      "Invalid URL format for thumbnailUrl",
    ],
  },
  youtubeLink: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/[^\s]*$/,
      "Invalid YouTube URL format",
    ],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VideoCategory",
    required: true,
  },
  accessLevel: {
    type: String,
    enum: ["Free", "Paid", "All"],
    default: "Free",
  },
  createdAt: { type: Date, default: Date.now },
});

// Ensure at least one of videoUrl or youtubeLink is provided
videoSchema.pre("validate", function (next) {
  if (!this.videoUrl && !this.youtubeLink) {
    next(new Error("Either videoUrl or youtubeLink is required"));
  }
  next();
});

// Index for efficient sorting
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Video", videoSchema);
