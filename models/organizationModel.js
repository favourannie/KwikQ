const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
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
  organizationForms: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizationforms"
  },
    emailAddress: {
          type: String,
          required: true,
          trim: true,
          unique: true
      },
      industryServiceType: {
          type: String,
          required: true,
          trim: true
      },
      headOfficeAddress : {
          type: String,
          required: true,
          trim: true
      },
      city: {
          type: String,
          required: false,
          trim: true
      },
      state: {
          type:String,
          required: false,
          trim: true
      },
      fullName: {
          type: String,
          required: false,
          trim: true
      },
      phoneNumber: {
          type: String,
          required: false,
          trim: true
      },
      branch: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "branches"
      }],
      organizations : {
          type: mongoose.Schema.Types.ObjectId,
          ref: "organizations"
      }
});


module.exports = mongoose.model("organizations", organizationSchema);
