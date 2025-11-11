const queueModel = require('../models/queueModel');
const customerModel = require('../models/customerQueueModel');
const branchModel = require("../models/branchModel")
const organizationModel = require("../models/organizationModel")
exports.getQueueHistory = async (req, res) => {
  try {
    const { id } = req.params
    const business = await organizationModel.findById(id) || await branchModel.findById(id)
    const filters = {business};

    const queues = await customerModel.find(filters).sort({ joinedAt: -1 });

    const historyData = queues.map((q) => {
      const joinedTime = q.joinedAt ? new Date(q.joinedAt) : null;
      const servedTime = q.servedAt ? new Date(q.servedAt) : null;
      const completedTime = q.completedAt ? new Date(q.completedAt) : null;

      const waitTime =
        servedTime && joinedTime
          ? Math.round((servedTime - joinedTime) / (1000 * 60))
          : 0;

      const serviceTime =
        completedTime && servedTime
          ? Math.round((completedTime - servedTime) / (1000 * 60))
          : 0;

      return {
        queueNumber: q.queueNumber || "N/A",
        customerName: q.formDetails?.fullName || "Unknown",
        serviceType: q.formDetails?.serviceNeeded || "Not specified",
        joinedDate: joinedTime ? joinedTime.toLocaleDateString() : "",
        joinedTime: joinedTime
          ? joinedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        waitTime: `${waitTime} min`,
        serviceTime: `${serviceTime} min`,
        status: q.status,
      };
    });

    res.status(200).json({
      message: "Queue history fetched successfully",
      count: historyData.length,
      data: historyData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching queue history: " + error.message,
    });
  }
};
