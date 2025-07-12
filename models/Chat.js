const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  messages: [
    {
      sender: { type: String, enum: ["customer", "agent"], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  chatType: {
    type: String,
    enum: ["consultancy", "product_support", "feedback", "general", "other"],
    default: "general",
  },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);
