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
  satisfiedRequests: Number,
  avgWaitTimeTrend: Number,
  serviceTypesDistribution: [{
    serviceType: String,
    count: Number
  }],
  avgServiceTime: Number,
  peakHours: [{
    hour: Number, // 0–23
    count: Number
  }],
   weeklyCustomerVolume: [{
    weekStart: Date,
    requestCount: Number
  }],
  topServices: [{
    serviceType: String,
    count: Number
  }]
});

module.exports = mongoose.model('analytics', analyticsSchema);
