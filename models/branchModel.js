const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  organizationName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizations",
    required: false
  },
  industryServiceType: {
    type: String,
    required: true
  },
  headOfficeAddress: {
    type: String,
    required: true
  }, 
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
  },
  emailAddress: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
});

module.exports = mongoose.model("branches", branchSchema);
