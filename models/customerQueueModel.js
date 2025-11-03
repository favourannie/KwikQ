const { required } = require('joi');
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
    email: { type: String, required: true },
    phone: { type: String, required: false },
    serviceNeeded: { type: String, required: true },
    additionalInfo: { type: String, required: false },
    priorityStatus: { type: Boolean, default: false},
    elderlyStatus: { type: Boolean, default: false},
    pregnantStatus: { type: Boolean, default: false },
    emergencyLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
  },

  // Queue tracking
  queueNumber: { type: String },
  status: {
    type: String,
    enum: ['waiting', 'in_service', 'completed', 'canceled', 'no_show'],
    default: 'waiting',
  },
  joinedAt: { type: Date, default: Date.now },
  servedAt: { type: Date },
  completedAt: { type: Date },

  rating: { type: Number, min: 1, max: 5 },

}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);