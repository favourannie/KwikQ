const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations'
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches'
  },
  queueID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers'
  },
  customerName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers'
  },
  serviceType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers'
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers'
  },
  dateAndTime: {
    type: Date,
    default: Date.now
  },
  serviceTime: {
    type: Number
  },
  waitTime: {
    type: Number,
  }
});

module.exports = mongoose.model('history', historySchema);
