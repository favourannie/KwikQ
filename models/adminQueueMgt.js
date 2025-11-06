const mongoose = require("mongoose");

const queueManagementSchema = new mongoose.Schema(
  {
    individualId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations", 
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "branches", 
    },
    businessType: {
      type: String,
      enum: ["organizations", "branches"],
      required: true,
    },
    queuePoints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "queues",
      },
    ],
    totalCustomers: {
      type: Number,
      default: 0,
    },
    totalWaiting: {
      type: Number,
      default: 0,
    },
    totalServedToday: {
      type: Number,
      default: 0,
    },
    averageWaitTime: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("adminManagements", queueManagementSchema);
