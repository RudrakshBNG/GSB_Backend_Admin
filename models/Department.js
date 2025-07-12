// models/Department.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const departmentSchema = new mongoose.Schema({
  departmentId: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Department", departmentSchema);
