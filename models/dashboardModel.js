const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches'
  },
  totalCustomers: {
    type: Number,
    default: 0
  },
  waitingCustomers: {
    type: Number,
    default: 0
  },
  servedCustomers: {
    type: Number,
    default: 0
  },
  missedCustomers: {
    type: Number,
    default: 0
  },
  cancelledCustomers: {
    type: Number,
    default: 0
  },
  averageWaitTime: {
    type: Number, // in minutes
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const dashboard = mongoose.model('Dashboard', dashboardSchema);


module.exports = dashboard