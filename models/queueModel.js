const mongoose = require("mongoose")

const queueSchema = new mongoose.Schema({
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "branches"
    },
    queuePoint : {
        type: Number
    },
    waiting: {
        type: Number,
        default: 0
    },
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

module.exports = mongoose.model("queues", queueSchema)

