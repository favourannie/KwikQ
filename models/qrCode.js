const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches',
    required: true,
  },

  qrCode: {
    type: String,
    unique: true,
    required: true,
  },

  qrImage: {
    type: String,
    required: true,
  },

  formLink: {
    type: String,
    required: true,
  },
  qrImageFile: {
    type: String,
  },

  // Metadata
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }, // Optional expiration date
  createdAt: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);