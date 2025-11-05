const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches',
    
  },
  lastNumber : {
    type: Number,
    default: 0,
  },

  // Form fields filled by customer
  formDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: false },
    serviceNeeded: { type: String, required: true,
       enum: ["accountOpening", "loanCollection","cardCollection", "fundTransfer", "accountUpdate", "generalInquiry", "complaintResolution", "other" ] 
      },
    additionalInfo: { type: String, required: false },
    priorityStatus: { type: String, 
      enum: ["regularStandard", "elderlyOrDisabled", "pregnantWoman", "emergencyOrUrgent"]
    },
  },

  // Queue tracking
  queueNumber: { type: String, required: false },
  status: {
    type: String,
    enum: ['waiting', 'in_service', 'completed', 'canceled', 'no_show'],
    default: 'waiting',
  },
  joinedAt: { type: String, default: '' },
  servedAt: { type: Date },
  completedAt: { type: Date },

  rating: { type: Number, min: 1, max: 5 },

}, { timestamps: true });

module.exports = mongoose.model('Customers', customerSchema);