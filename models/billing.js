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
brand: { type: String }, 
last4: { 
  type: String 
},
downloadUrl: { type: String }, // url to pdf file stored in S3 / provider
expiryDate: { 
  type: String, match: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/ }, // MM/DD/YYYY
cvv: {
  type: Number
},
issuedAt: { type: Date, default: Date.now },
invoiceNumber: { type: String, required: true },
createdAt: { 
    type: Date, 
    default: Date.now 
  },
});


const billModel = mongoose.model('Billing', billingSchema);

module.exports = billModel;
