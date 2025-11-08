const customerModel = require("../models/customerQueueModel");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel")
const queueManagement = require("../models/queueManagement");
exports.getDashboardMetrics = async (req, res) => {
    try {

        const {id} = req.params;
        let business = await organizationModel.findById(id)

        if(business){
            if(business.role === "multi"){
                query = {organization: business._id}
            }else {
                query = {organization: business._id}
            } 
        }else {
                business = await branchModel.findById(id)
                 if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      query = { branch: business._id };
    }
       const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const [
      activeInQueue,
      activeYesterday,
      servedToday,
      servedYesterday,
    ] = await Promise.all([
      // Active customers today (waiting or being served)
      customerModel.countDocuments({
        ...query,
        status: { $in: ["waiting", "in_service"] },
      }),

      // Active customers yesterday
      customerModel.countDocuments({
        ...query,
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        status: { $in: ["waiting", "in_service"] },
      }),

      // Served today
      customerModel.find({
        ...query,
        status: "completed",
        servedAt: { $gte: startOfToday },
      }),

      // Served yesterday
      customerModel.find({
        ...query,
        status: "served",
        servedAt: { $gte: startOfYesterday, $lt: startOfToday },
      }),
    ]);

    // Compute averages
    const avgWaitTime =
      servedToday.length > 0
        ? servedToday.reduce((acc, c) => acc + (c.waitTime || 0), 0) /
          servedToday.length
        : 0;

    const avgWaitTimeYesterday =
      servedYesterday.length > 0
        ? servedYesterday.reduce((acc, c) => acc + (c.waitTime || 0), 0) /
          servedYesterday.length
        : 0;

    // Compute percentage changes
    const active =
      activeYesterday > 0
        ? ((activeInQueue - activeYesterday) / activeYesterday) * 100
        : 0;

    const waitTime =
      avgWaitTimeYesterday > 0
        ? ((avgWaitTime - avgWaitTimeYesterday) / avgWaitTimeYesterday) * 100
        : 0;

    const served =
      servedYesterday.length > 0
        ? ((servedToday.length - servedYesterday.length) /
            servedYesterday.length) *
          100
        : 0;

    // Send response
    res.status(200).json({
      message: "Dashboard metrics fetched successfully",
      data: {
        activeInQueue: {
          current: activeInQueue,
          percentageChange: Math.round(active),
        },
        averageWaitTime: {
          current: Math.round(avgWaitTime),
          percentageChange: Math.round(waitTime),
        },
        servedToday: {
          current: servedToday.length,
          percentageChange: Math.round(served),
        },
      },
    });
    } catch (error) {
        res.status(400).json({
            message: "Error getting dashboard metrics",
            error: error.message
        });
    }
};

