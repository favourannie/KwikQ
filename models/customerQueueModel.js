const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organizations',
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'branches',
    required: true,
    unique: true,
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
    serviceNeeded: { type: String, required: true },
    additionalInfo: { type: String, required: false },
    priorityStatus: { type: String, 
      enum: ["regularStandard", "elderlyOrDisabled", "pregnantWoman", "emergencyOrUrgent"]
    },
  },

  // Queue tracking
  queueNumber: { type: Number, required: true },
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