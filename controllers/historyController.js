const historyModel = require('../models/historyModel');
exports.getHistory = async (req, res) => {
    try {
         
        res.status(200).json({
            message: "History fetched successfully",
            data: history
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching history",
            error: error.message
        })
    }
}