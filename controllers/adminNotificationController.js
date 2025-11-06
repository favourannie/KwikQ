const CustomerInterface = require("../models/customerQueueModel")

exports.getNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query; 

    let filters = {};

    if (role === "multi") {
      filters.branchId = id;
    } else if (role === "individual") {
      filters.individualId = id;
    } else {
      return res.status(400).json({ message: "Role must be either 'multi' or 'individual'" });
    }

    const queueActivities = await CustomerInterface.find(filters)
      .select("formDetails queueNumber joinedAt")
      .sort({ joinedAt: -1 });


    if (queueActivities.length === 0) {
      return res.status(200).json({
        message: "No notifications available yet",
        totalNotifications: 0,
        highPriorityCount: 0,
        data: [],
      });
    }

    const notifications = queueActivities.map((item) => {
      const { fullName, serviceNeeded, priorityStatus } = item.formDetails;
      return {
        message: `${fullName} joined the queue for ${serviceNeeded}`,
        queueNumber: item.queueNumber,
        createdAt: item.joinedAt,
        priority: priorityStatus === "high" ? "high" : "normal",
        isRead: false,
      };
    });


    const totalNotifications = notifications.length;
    const highPriorityCount = notifications.filter((n) => n.priority === "high").length;

    res.status(200).json({
      message: "Notifications fetched successfully",
      totalNotifications,
      highPriorityCount,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};
