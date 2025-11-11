const mongoose = require("mongoose")

const queueSchema = new mongoose.Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branches"
    },
    individualId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations"
    },
    name: {
        type: String,
        required: false,
    },
    number : {
        type: Number,
        default: 0
    },
    waiting: {
        type: Number,
        default: 0
    },
    customers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
    },
  ],
    servedToday: {
        type: Number,
        default: 0
    },
    serving: {
        type: Number,
        default: 0
    },
    averageWaitTime: {
        type: Number,
        default: 0
    },
    
}, {timeStamps: true})

const queueModel = mongoose.model("queues", queueSchema);

module.exports = queueModel;

