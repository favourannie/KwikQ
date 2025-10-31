const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizations",
    required: false
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
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

module.exports = mongoose.model("branch", branchSchema);
