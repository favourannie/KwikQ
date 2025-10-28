const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  queueNumber: {
     type: String, required: true 
    },
    name: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
    },
    waitTime:{
        type: Number
    },
  branch: {
     type: mongoose.Schema.Types.ObjectId, ref: "branches" 
    },
  queuePoint: { 
    type: mongoose.Schema.Types.ObjectId, ref: "queues"
 },
  status: { 
    type: String, 
    enum: ["waiting", "serving", "served"], default: "waiting"
 },
  joinedAt: { 
    type: Date, 
    default: Date.now 
},
  servedAt: { 
    type: Date
 },
}, { timestamps: true });

module.exports = mongoose.model("customers", customerSchema);
