const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "branches"
  }]
});

module.exports = mongoose.model("organizations", organizationSchema);
