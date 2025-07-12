// models/TeamMember.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const teamMemberSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
});

module.exports = mongoose.model("TeamMember", teamMemberSchema);
