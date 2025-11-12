const mongoose = require("mongoose")

const adminSettingsSchema =  new mongoose.Schema({
    individualId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations"
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branches"
    },
    businessName: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
        businessAddress:{
            type: String,
            trim: true
        },
    openingTime: { 
    type: String, 
  }, 
  closingTime: { 
    type: String, 
  }, 
  workingDays: {
    type: [String],
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    default: "Mon"
  },
  timezone: { 
    type: String,
     default: "Africa/Lagos"
     },
  createdAt: {
    type: Date,
    default: Date.now
},
}, {timestamps: true})

module.exports = mongoose.model("adminSettings", adminSettingsSchema)