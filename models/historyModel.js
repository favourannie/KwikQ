const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  customerRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customerRequests'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations'
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches'
  },
  customerName: String,
  serviceType: String,
  status: {
    type: String,
    enum: ['served', 'cancelled', 'missed'],
    required: true
  },
  ticketNumber: String,
  createdAt: Date,
  servedAt: Date,
  duration: Number // minutes waited or served
});

module.exports = mongoose.model('history', historySchema);
