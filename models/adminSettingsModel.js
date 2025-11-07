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
        }
}, {timestamps: true})

module.exports = mongoose.model("adminSettings", adminSettingsSchema)