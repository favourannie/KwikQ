const mongoose = require("mongoose")

const organizationFormSchema = new mongoose.Schema({
    emailAddress: {
        type: String,
        required: true,
        trim: true
    },
    industryServiceType: {
        type: String,
        required: true,
        trim: true
    },
    headOfficeAddress : {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type:String,
        required: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    branch: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "branches"
    }],
    organizations : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations"
    }
})

module.exports = mongoose.model("organizationforms", organizationFormSchema)