const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches'
  },
  queuePrefix: {
    type: String,
    default: 'Q-'
  },
  maxQueueLength: {
    type: Number,
    default: 100
  },
  autoNotifyCustomer: {
    type: Boolean,
    default: true
  },
  notifyBeforeTurn: {
    type: Number, // minutes before their turn
    default: 5
  },
  allowWalkIn: {
    type: Boolean,
    default: true
  },
  smsProvider: {
    type: String,
    default: 'twilio'
  },
  emailProvider: {
    type: String,
    default: 'gmail'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('settings', settingsSchema);
