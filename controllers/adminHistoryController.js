const QueuePoint = require('../models/queueModel');
const customerModel = require('../models/customerQueueModel');
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");

const calculateQueueMetrics = (queuePoints) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  let completedToday = 0;
  let totalWaitTime = 0;
  let totalCustomers = 0;
  let cancelledNoShow = 0;
  
  queuePoints.forEach((queue) => {
    queue.customers.forEach((c) => {
      const joinedAt = c.joinedAt ? new Date(c.joinedAt) : null;
      const servedAt = c.servedAt ? new Date(c.servedAt) : null;
      const completedAt = c.completedAt ? new Date(c.completedAt) : null;

      const waitTime = joinedAt
        ? Math.round((Date.now() - joinedAt.getTime()) / 60000)
        : 0;

      totalWaitTime += waitTime;
      totalCustomers++;
      if (
        c.status === "completed" &&
        completedAt &&
        completedAt >= startOfToday &&
        completedAt <= endOfToday
      ) {
        completedToday++;
      }

      if (["canceled", "no_show"].includes(c.status)) {
        cancelledNoShow++;
      }
    });
  });

  const avgWaitTime =
    totalCustomers > 0 ? Math.round(totalWaitTime / totalCustomers) : 0;

  return { avgWaitTime, cancelledNoShow };
};

exports.getQueueHistory = async (req, res) => {
  try {
    const { id } = req.params;

    let business = await organizationModel.findById(id);
    if (!business) business = await branchModel.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const query =
      business.role === "multi"
        ? { branchId: id }
        : { individualId: id };

    const queuePoints = await QueuePoint.find(query).populate("customers");

    if (!queuePoints.length) {
      return res.status(200).json({
        message: "No customers currently in queue",
        data: [],
        metrics: { completedToday: 0, avgWaitTime: 0, cancelledNoShow: 0 },
      });
    }

    const completed = await customerModel.find({
      $or: [
        { individualId: business._id, status: "completed" },
        { branchId: business._id, status: "completed" },
      ],
    });

    const customersInQueue = [];

    queuePoints.forEach((queue) => {
      queue.customers.forEach((c) => {
        const joinedAt = c.joinedAt ? new Date(c.joinedAt) : null;
        const waitTime = joinedAt
          ? Math.round((Date.now() - joinedAt.getTime()) / 60000)
          : 0;

        const servedAt = c.servedAt ? new Date(c.servedAt) : null;
        const completedAt = c.completedAt ? new Date(c.completedAt) : null;

        const serviceTime =
          servedAt && completedAt
            ? Math.round((completedAt.getTime() - servedAt.getTime()) / 60000)
            : 0;

        const joinedAtFormatted = joinedAt
          ? joinedAt.toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              timeZoneName: "short",
            })
          : "N/A";

        customersInQueue.push({
          queueNumber: c.queueNumber || "N/A",
          fullName: c.formDetails?.fullName || "Unknown",
          service: c.formDetails?.serviceNeeded || "N/A",
          serviceTime: `${serviceTime} min`,
          status: c.status,
          phone: c.formDetails?.phone || "N/A",
          joinedAt: joinedAtFormatted, 
          waitTime: `${waitTime} min`,
        });
      });
    });

    customersInQueue.sort(
      (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
    );

    const metrics = calculateQueueMetrics(queuePoints);

    res.status(200).json({
      message: "Queue history fetched successfully",
      metrics,
      completedToday: completed.length,
      data: customersInQueue,
    });
  } catch (error) {
    console.error("Error fetching history data:", error);
    res.status(500).json({
      message: "Error fetching history data",
      error: error.message,
    });
  }
};
