const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  branch: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: "branches"
     },
  message: { 
    type: String
 },
  timestamp: { 
    type: Date, 
    default: Date.now 
},
  type: {
     type: String,
     enum: ["joined", "served", "alert"], 
     default: "joined" 
    }
}, { timestamps: true });

module.exports = mongoose.model("activities", activitySchema);
