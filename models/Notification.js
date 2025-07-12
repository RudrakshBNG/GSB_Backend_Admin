const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipients: { type: String, default: 'All Users' }, // Can be expanded later
  status: { type: String, enum: ['Sent'], default: 'Sent' },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
