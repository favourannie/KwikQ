const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches'
  },
  date: {
    type: Date,
    default: Date.now
  },
  totalRequests: {
    type: Number
  },
  satisfiedRequests: {
    type: Number
  },
  avgWaitTimeTrend: {
    type: Number
  },
  serviceTypesDistribution: [{
    serviceType: String,
    count: Number
  }],
  avgServiceTime:  {
    type: Number
  },
  peakHours: [{
    hour: Number, 
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
