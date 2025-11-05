const { string } = require('joi');
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
  description: {
    type: String,
  },
    // ✅ Card Information (non-sensitive)

cardHolderName: { 
  type: String 
},
cardType: { 
  type: String 
},
last4: { 
  type: String 
},
expiryDate: { 
  type: String, match: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/ }, // MM/DD/YYYY
cvv: {
  type: Number
},
createdAt: { 
    type: Date, 
    default: Date.now 
  },
});


module.exports = mongoose.model('Billing', billingSchema);
