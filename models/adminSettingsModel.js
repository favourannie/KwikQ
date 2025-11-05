const mongoose = require("mongoose")

const adminSettingsSchema =  new mongoose.Schema({
    individualId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations"
    },
    branchId: {
        type: mongoose
    }
})