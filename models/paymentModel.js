const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations'
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches'
  },
  amount: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Successful', 'Failed'],
    default: 'Pending'
  }
});

const paymentModel = mongoose.model('payments', paymentSchema);

module.exports = paymentModel;