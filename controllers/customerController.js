const Customer = require("../models/customerModel");

// Add customer to queue from QR scan
const addCustomerFromQR = async (req, res) => {
    try {
        const { name, serviceType, branch, queuePoint } = req.body;
        // Generate a queue number (customize as needed)
        const queueNumber = `Q-${Date.now()}`;
        const customer = await Customer.create({
            name,
            serviceType,
            branch,
            queuePoint,
            queueNumber,
            status: "waiting"
        });
        res.status(201).json({ success: true, data: customer });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = {
    addCustomerFromQR
    // ...add other exports here if needed
};
