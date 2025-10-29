const mongoose = require('mongoose');

const adminQueueManagementSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    required: true,
  },

  // All branches belonging to the organization
  branches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'branches',
    },
  ],

  // Option to search for a queue by multiple identifiers
  searchFilters: {
    queueId: { type: String },
    queueNumber: { type: String },
    customerName: { type: String },
  },

  // System-wide queue activity records
  queues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'branchQueueManagement', // references the branch model below
    },
  ],

  // For analytics and performance tracking
  totalActiveQueues: { type: Number, default: 0 },
  totalServedToday: { type: Number, default: 0 },
  avgWaitTime: { type: Number, default: 0 }, // in minutes

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('adminQueueManagement', adminQueueManagementSchema);
