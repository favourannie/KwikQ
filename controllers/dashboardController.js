const customerModel = require("../models/customerQueueModel");
const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");
const dashboardModel = require("../models/dashboardModel");

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.body;

    const customer = await customerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.status = status;

    if (status === "completed") {
      customer.completedAt = new Date();

      if (customer.servedAt) {
        const serviceDuration = (Date.now() - customer.servedAt.getTime()) / 60000; // in minutes
        customer.serviceTime = serviceDuration;
      }

      if (customer.joinedAt) {
        const totalWait = (customer.servedAt
          ? customer.servedAt.getTime() - customer.joinedAt.getTime()
          : Date.now() - customer.joinedAt.getTime()) / 60000;
        customer.waitTime = totalWait;
      }
    }

    await customer.save();

    res.status(200).json({
      message: "Customer status updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error updating customer status:", error);
    res.status(500).json({
      message: "Error updating customer status",
      error: error.message,
    });
  }
};




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

  return { avgWaitTime, completedToday, cancelledNoShow };
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    const id = req.user.id;
    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    let active, served;
    if (business.role === "individual") {
      active = await customerModel.find({
        individualId: business._id,
        status: "waiting",
      });

      served = await customerModel.find({
        individualId: business._id,
        status: "completed",
      });
    } else if (business.role === "multi") {
      active = await customerModel.find({
        branchId: business._id,
        status: "waiting",
      });

      served = await customerModel.find({
        branchId: business._id,
        status: "completed",
      });
    }

    const queuePoints = [
      { customers: [...active, ...served] }, // combine active and served customers
    ];

    const { avgWaitTime } = calculateQueueMetrics(queuePoints);

    res.status(200).json({
      message: "Dashboard metrics retrieved successfully",
      data: {
        activeInQueue: active.length,
        servedToday: served.length,
        avgWaitTime, 
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error getting dashboard metrics",
    });
  }
};



exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    let business =
      (await organizationModel.findById(userId)) ||
      (await branchModel.findById(userId));

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const query =
      business.role === "multi"
        ? { branchId: business._id }
        : { individualId: business._id };

    const recentCustomers = await customerModel
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(10);

    const activities = recentCustomers.map((c) => {
      let action = "";

      if (c.status === "completed") {
        action = `Served`;
      } else if (c.status === "waiting") {
        action = `Joined queue`;
      } else if (c.status === "in_service") {
        action = `Being served`;
      } else if (c.status === "alerted") {
        action = `Alert sent`;
      }

      const minutesAgo = Math.max(
        Math.round((Date.now() - new Date(c.updatedAt)) / 60000),
        1
      );

      return {
        queueNumber: c.queueNumber || "N/A",
        action,
        timeAgo: `${minutesAgo} min ago`,
      };
    });

    res.status(200).json({
      message: "Recent activity fetched successfully",
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recent activity",
      error: error.message,
    });
  }
};
