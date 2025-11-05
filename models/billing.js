const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  individualId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'organizations',
},
branchId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'branches'
},
  amount: { 
    type: Number, 
    required: true 
},
  currency: { 
    type: String, 
    default: 'NGN' 
},
  method: { 
    type: String, 
    enum: ['card', 'bank', 'transfer'], 
    default: 'card' 
},
  transactionId: { 
    type: String, 
    required: true 
},
  status: { 
    type: String, 
    enum: ['success', 'failed', 'pending'], 
    default: 'success' 
},
  description: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Billing', billingSchema);
