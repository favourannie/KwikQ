const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizations",
    required: false
  },
  orgainzationName: {
    type: String,
    required: true
  },
  industryServiceType: {
    type: String,
    required: true
  },
  headOfficeAddress: {
    type: String,
    required: true
  }, 
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
  },
  emailAddress: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  branchName: {
    type: String,
    required: true
  },
  branchCode: {
    type: String,
    reqiured: true
  },
  address: {
    type: String,
    required: true
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  serviceType: {
    type: String,
    required: true
  },
  managerName: {
    type: String,
    required: true
  },
  managerEmail: {
    type: String,
    required: true
  },
  managerPhone: {
    type: String,
    required: true
  },
});

module.exports = mongoose.model("branches", branchSchema);
