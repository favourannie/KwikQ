const queueModel = require("../models/queueModel");
const activityModel = require("../models/recentActivityModel")
exports.getQueueStats = async (req, res) => {
  try {
    const { branchId } = req.params;

    
    const queues = await queueModel.find({ branch: branchId });

    
    const activeInQueue = queues.reduce((sum, q) => sum + q.waiting, 0);
    const averageWaitTime =
      queues.length > 0
        ? Math.round(queues.reduce((sum, q) => sum + q.averageWaitTime, 0) / queues.length)
        : 0;
    const servedToday = queues.reduce((sum, q) => sum + q.servedToday, 0);

    const activities = await activityModel.find({ branch: branchId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Dashboard data fetched successfully",
      data: {
        activeInQueue,
        averageWaitTime,
        servedToday,
        queues,
        recentActivity: activities,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
