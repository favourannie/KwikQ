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
  industryServiceType:{
    type: String,
    trim: true
  },
  headOfficeAddress: {
    type: String,
    trim:true
  },
  city : {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true,
    
  },
  fullName: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches"
  }]
});

module.exports = mongoose.model("organizations", organizationSchema);
