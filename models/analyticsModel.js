const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches'
  },
  date: {
    type: Date,
    default: Date.now
  },
  totalRequests: Number,
  servedRequests: Number,
  cancelledRequests: Number,
  missedRequests: Number,
  avgWaitTime: Number,
  avgServiceTime: Number,
  peakHours: [{
    hour: Number, // 0–23
    count: Number
  }],
  topServices: [{
    serviceType: String,
    count: Number
  }]
});

module.exports = mongoose.model('analytics', analyticsSchema);
