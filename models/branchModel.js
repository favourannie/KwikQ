const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organizations",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
  },
  managerName: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  email: {
    type: String,
  }
});

module.exports = mongoose.model("branches", branchSchema);
