const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches',
    default: null,
  },

  qrCode: {
    type: String,
    unique: true,
   
  },

  qrImage: {
    type: String,
    
  },

  formLink: {
    type: String,
   
  },
  qrImageFile: {
    url: { type: String, },
    publicId: { type: String,  },
  },

  // Metadata
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }, // Optional expiration date
  createdAt: { type: Date, default: Date.now },

}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);