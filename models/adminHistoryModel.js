const mongoose = require("mongoose")

const adminHistoryScema = new mongoose.Schema({
    individualId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations"
    },
    branchId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "branches"   
    },
    queuePoints:{
         type: mongoose.Schema.Types.ObjectId,
        ref: "queues"
    },
    customer: {
         type: mongoose.Schema.Types.ObjectId,
        ref: "Customers"
    }
})