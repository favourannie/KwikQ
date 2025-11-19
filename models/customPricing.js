const mongoose = require("mongoose");

const customPricingSchema = new mongoose.Schema({
  individualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizations",
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches",
  },
  companyName: {
    type: String,
    trim: true,
    required: true,
  },
  fullName: {
    type: String,
    trim: true,
    required: true,
  },
  workEmail: {
    type: String,
    trime: true,
    lowerCase: true,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  companySize: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
  },
  features: {
    type: String,
    enum: ["queue-management-system", "advanced-analytics-reporting", "multi-branch-management"],
  },
  additionalInformation: {
    type: String,
  }
});

module.exports = mongoose.model("customPrices", customPricingSchema);
