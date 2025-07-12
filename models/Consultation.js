const mongoose = require("mongoose");

const consultancySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true, // Make user mandatory for requests submitted via user ID
  },
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  message: String,
  status: {
    type: String,
    enum: ["new", "in-progress", "resolved"],
    default: "new",
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" }, // Reference to team member
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ConsultancyRequest", consultancySchema);
// // models/ConsultancyRequest.js
// const mongoose = require('mongoose');

// const consultancySchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: String,
//   phoneNumber: String,
//   message: String,
//   status: {
//     type: String,
//     enum: ['new', 'in-progress', 'resolved'],
//     default: 'new',
//   },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }, // Reference to team member
//   notes: String,
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('ConsultancyRequest', consultancySchema);
