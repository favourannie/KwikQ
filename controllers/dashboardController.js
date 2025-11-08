const customerModel = require("../models/customerQueueModel");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");

exports.getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    let business = await organizationModel.findById(userId) || await branchModel.findById(userId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    let query = {};
    if (business.role === "individual") query = { individualId: business._id };
    else if (business.role === "multi") query = { branchId: business._id };
    else return res.status(403).json({ message: "Unauthorized role" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayStart);

    const [activeToday, activeYesterday, servedToday, servedYesterday] = await Promise.all([
      customerModel.countDocuments({
        ...query,
        status: { $in: ["waiting", "in_service"] },
      }),


      customerModel.countDocuments({
        ...query,
        createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
        status: { $in: ["waiting", "in_service"] },
      }),

      customerModel.find({
        ...query,
        status: "completed",
        completedAt: { $gte: todayStart, $lt: tomorrowStart },
      }),

      customerModel.find({
        ...query,
        status: "completed",
        completedAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
      }),
    ]);

    const avgWaitTimeToday =
      servedToday.length > 0
        ? servedToday.reduce((acc, c) => acc + (c.waitTime || 0), 0) / servedToday.length
        : 0;

    const avgWaitTimeYesterday =
      servedYesterday.length > 0
        ? servedYesterday.reduce((acc, c) => acc + (c.waitTime || 0), 0) / servedYesterday.length
        : 0;

    const activeChange =
      activeYesterday > 0 ? ((activeToday - activeYesterday) / activeYesterday) * 100 : 0;

    const servedChange =
      servedYesterday.length > 0
        ? ((servedToday.length - servedYesterday.length) / servedYesterday.length) * 100
        : 0;

    const waitTimeChange =
      avgWaitTimeYesterday > 0
        ? ((avgWaitTimeToday - avgWaitTimeYesterday) / avgWaitTimeYesterday) * 100
        : 0;

    res.status(200).json({
      message: "Dashboard metrics fetched successfully",
      data: {
        activeInQueue: {
          current: activeToday,
          percentageChange: Math.round(activeChange),
        },
        averageWaitTime: {
          current: Math.round(avgWaitTimeToday),
          percentageChange: Math.round(waitTimeChange),
        },
        servedToday: {
          current: servedToday.length,
          percentageChange: Math.round(servedChange),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      message: "Error getting dashboard metrics",
      error: error.message,
    });
  }
};
