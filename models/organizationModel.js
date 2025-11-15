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
  isOnBoarded: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    lowercase: true,
    trim: true,
    enum: ["individual", "multi"]
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
  subscriptionDuration: {
    type: String,
    enum: ["monthly", "annually"],
    lowerCase: true
  },
  subscriptionType: {
    type: String,
    enum: ["freemium", "starter", "professional", "enterprise"],
    lowerCase: true
  },
  subscriptionExpiredAt: {
    type: Number
  },
  status: { type: String, enum: ['active', 'trial', 'inactive'], default: 'trial' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches"
  }]
});


const organizationModel = mongoose.model("organizations", organizationSchema);

module.exports = organizationModel;
