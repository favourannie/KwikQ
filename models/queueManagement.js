const mongoose = require('mongoose');

const branchQueueManagementSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    required: true,
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches',
    required: true,
  },

  // Queue service points (e.g., desks, counters, or tellers)
  servicePoints: [
    {
      name: { type: String, required: true },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },
      currentQueue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'queueTickets',
      },
    },
  ],

  // Each ticket represents a customer in queue
  queueTickets: [
    {
      ticketNumber: { type: String, required: true },
      customerName: { type: String },
      status: {
        type: String,
        enum: ['waiting', 'alerted', 'skipped', 'served', 'removed'],
        default: 'waiting',
      },
      createdAt: { type: Date, default: Date.now },
      servedAt: { type: Date },
    },
  ],

  // Queue metrics
  activeInQueue: { type: Number, default: 0 },
  avgWaitTime: { type: Number, default: 0 }, // in minutes
  servedToday: { type: Number, default: 0 },

  // Queue operations
  actions: [
    {
      actionType: {
        type: String,
        enum: ['alert', 'skip', 'remove'],
      },
      ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'queueTickets',
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // staff who performed the action
      },
      actionTime: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

const branchQueueModel = mongoose.model('branchQueueManagement', branchQueueManagementSchema);

module.exports = branchQueueModel;
