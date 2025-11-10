const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations'
  },
  // branchId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'branches'
  // },

  org: {
    type: String,
    enum: [ 'individual', 'multi']
  },
  amount: {
    type: Number,
    required: true
  },
  billingCycle: {
  type: String,
  enum: ['monthly', 'annual'],
  required: true},
  
  reference: {
    type: String,
    required: true
  },
  renewalDate: Date,
  paymentMethod: String,
  planType: { type: String, enum: ['starter', 'professional', 'enterprise'],default: 'free' },
  nextBillingDate: Date,
  status: {
    type: String,
    enum: ['Pending', 'Successful', 'Failed'],
    default: 'Pending'
  }
});

const paymentModel = mongoose.model('payments', paymentSchema);

module.exports = paymentModel;