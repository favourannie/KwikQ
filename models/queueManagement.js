const mongoose = require('mongoose');

const queueManagementSchema = new mongoose.Schema({
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches',
    required: true
  },
  activeQueues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customerRequests'
  }],
  currentTicket: {
    type: String
  },
  nextTicket: {
    type: String
  },
  counterAssigned: {
    type: String // e.g., "Counter 1"
  },
  averageServiceTime: {
    type: Number, // minutes
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('queueManagement', queueManagementSchema);
