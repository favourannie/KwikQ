const adminQueueMgtModel = require("../models/adminQueueManagement");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");

exports.getAllQueues = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await organizationModel.findById(id) || await branchModel.findById(id)
    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }


    const adminQueueData = await adminQueueMgtModel
      .findOne({ business: id })
      .populate({
        path: "queues",
        populate: {
          path: "queueTickets",
          select: "ticketNumber customerName status createdAt servedAt",
        },
      })
    //   .populate("branches", "branchName city state")
      .lean();

    if (!adminQueueData) {
      return res.status(200).json({
        message: "No queues found for this business",
        data: [],
      });
    }


    res.status(200).json({
      message: "All queues fetched successfully",
      business: business.businessName,
      totalActiveQueues: adminQueueData.totalActiveQueues,
      totalServedToday: adminQueueData.totalServedToday,
      avgWaitTime: adminQueueData.avgWaitTime,
      data: adminQueueData.queues,
    });
  } catch (error) {
    console.error("Error fetching business queues:", error);
    res.status(500).json({
      message: "Error fetching business queues",
      error: error.message,
    });
  }
};
