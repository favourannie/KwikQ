const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim:true
  },
  password: {
    type: String,
    required: true,
    trim: true

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
  role:{
    type: String,
    default: "admin"
  },
  organizationForms: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizationforms"
  },
  
  // References to branches
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches"
  }]
});


module.exports = mongoose.model("organizations", organizationSchema);
