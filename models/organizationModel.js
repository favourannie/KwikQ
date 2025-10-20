const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // OTP fields for email verification
  otp: {
    type: String,
  },
  otpExpiredAt: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin:{
    type: Boolean,
    default: false
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches"
  }]
});

module.exports = mongoose.model("organizations", organizationSchema);
