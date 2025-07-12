const mongoose = require('mongoose');
const pdfSchema = new mongoose.Schema({
title: { type: String, required: true },
  description: String,
  pdfUrl: { type: String, required: true },
  thumbnailUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PDF', pdfSchema);
