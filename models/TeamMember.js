// models/TeamMember.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const teamMemberSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["super_admin", "admin", "team_member"],
    default: "team_member",
  },
  department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  ],
  assignedChats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: [],
    },
  ],
  permissions: {
    dashboard: { type: Boolean, default: false },
    users: { type: Boolean, default: false },
    stories: { type: Boolean, default: false },
    dailyUpdates: { type: Boolean, default: false },
    consultations: { type: Boolean, default: false },
    chats: { type: Boolean, default: false },
    teams: { type: Boolean, default: false },
    videos: { type: Boolean, default: false },
    dietPlans: { type: Boolean, default: false },
    products: { type: Boolean, default: false },
    orders: { type: Boolean, default: false },
    payments: { type: Boolean, default: false },
    notifications: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TeamMember", teamMemberSchema);
