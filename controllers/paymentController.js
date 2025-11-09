const branchModel = require("../models/branchModel")
const organizationModel = require("../models/organizationModel")

exports.initializePayment = async(req,res) => {
    try {
        
    } catch (error) {
        res.status(500).json({
            message: "Error initializing payment",
            error: error.message
        })
    }
}