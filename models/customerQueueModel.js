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
  
formDetails:{
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: false },
  serviceNeeded: { type: String, required: true,
    enum: ["accountOpening", "loanCollection","cardCollection", "fundTransfer", "accountUpdate", "generalInquiry", "complaintResolution", "other" ] 
  },
  additionalInfo: { type: String, required: false },
  priorityStatus: { 
    type: String, 
    default: "regularStandard"
  }
  },

  // Queue tracking
  queueNumber: { type: String, required: false },
  serialNumber: {type: String},
  status: {
    type: String,
    enum: ['waiting', 'in_service', 'completed', 'canceled', 'no_show'],
    default: 'waiting',
  },
  waitTime: {type: Number, default: 0},
  serviceTime: {type: Number, default: 0},
  joinedAt: { type: Date, default: Date.now },
  servedAt: { type: Date },
  completedAt: { type: Date },

  rating: { type: Number, min: 1, max: 5 },

}, { timestamps: true });
customerSchema.pre('save', function(next) {
  if (this.isModified('servedAt') && this.servedAt && this.joinedAt) {
    this.waitTime = Math.floor((this.servedAt - this.joinedAt) / 1000 / 60); // minutes
  }

  if (this.isModified('completedAt') && this.completedAt && this.servedAt) {
    this.serviceTime = Math.floor((this.completedAt - this.servedAt) / 1000 / 60); // minutes
  }

  next();
});

const queueModel = mongoose.model('Customers', customerSchema);

module.exports = queueModel;