const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizations"
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
  role: {
    type: String,
    default: "branch"
  },
  managerPhone: {
    type: String,
    required: true
  },
 status: { type: String, enum: ['Active', 'Warning', 'Offline'], default: 'Active' },
  avgWaitTime: { type: Number, default: 0 },
  servedToday: { type: Number, default: 0 },
  activeQueue: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const branchModel = mongoose.model("branches", branchSchema);

module.exports = branchModel;
