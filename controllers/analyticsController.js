const analyticsModel = require('../models/analyticsModel');
const customerModel = require('../models/customerQueueModel');
const organizationModel = require('../models/organizationModel');
const branchModel = require("../models/branchModel")

const calculateAverageWaitTime = (customers) => { if (!customers || customers.length === 0) return 0; const totalWaitTime = customers.reduce((acc, customer) => { if (!customer.joinTime || !customer.serviceEndTime) return acc; const waitTime = (new Date(customer.serviceEndTime) - new Date(customer.joinTime)) / 60000; return acc + (waitTime > 0 ? waitTime : 0); }, 0); return Math.round((totalWaitTime / customers.length) * 10) / 10; };
exports.getBranchAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const org =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!org) {
      return res.status(404).json({ message: "Business not found" });
    }

    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    let customers = [];

    if (org.role === "branch") {
      customers = await customerModel.find({
        branchId: id,
        joinTime: { $gte: start, $lte: end },
      });
    } else if (org.role === "individual") {
      customers = await customerModel.find({
        individualId: id,
        joinTime: { $gte: start, $lte: end },
      });
    }

    const totalCustomers = customers.length;

    const avgWaitTime = calculateAverageWaitTime(customers);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyVolume = Array(7).fill(0);

    customers.forEach((c) => {
      if (c.joinTime) weeklyVolume[new Date(c.joinTime).getDay()]++;
    });

    const weeklyCustomerVolume = days.map((day, i) => ({
      day,
      count: weeklyVolume[i],
    }));

    const hours = Array(24).fill(0);
    customers.forEach((c) => {
      if (c.joinTime) hours[new Date(c.joinTime).getHours()]++;
    });

    const peakHours = hours.map((count, hour) => ({ hour, count }));

    const serviceTypes = {};
    customers.forEach((c) => {
      const service = c.formDetails?.serviceNeeded || c.serviceNeeded;
      if (service) serviceTypes[service] = (serviceTypes[service] || 0) + 1;
    });

    const serviceTypesDistribution = Object.entries(serviceTypes).map(
      ([serviceType, count]) => ({ serviceType, count })
    );

    const satisfiedCustomers = customers.filter(
      (c) => c.servedAt && c.completedAt && c.status === "completed"
    ).length;

    const analytics = await analyticsModel.create({
      organization: org._id,
      branch: id,
      date: new Date(),
      totalRequests: totalCustomers,
      satisfiedRequests: satisfiedCustomers,
      avgWaitTimeTrend: avgWaitTime,
      serviceTypesDistribution,
      peakHours,
      weeklyCustomerVolume: [
        {
          weekStart: start,
          requestCount: totalCustomers,
        },
      ],
      topServices: serviceTypesDistribution
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    });

    res.status(200).json({
      message: "Analytics fetched successfully",
      data: {
        totalCustomers,
        avgWaitTime,
        weeklyCustomerVolume,
        peakHours,
        serviceTypesDistribution,
        satisfactionRate:
          totalCustomers > 0
            ? ((satisfiedCustomers / totalCustomers) * 100).toFixed(1)
            : 0,
        analytics,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};
