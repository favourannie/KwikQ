const mongoose = require("mongoose");

const queueConfigSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizations",
  },

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches",
  },

  maxQueueSize: {
    type: Number,
    default: 100, 
  },

  avgServiceTime: {
    type: Number,
    default: 10, // in minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("queueConfigs", queueConfigSchema);
