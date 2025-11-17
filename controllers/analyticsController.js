const analyticsModel = require('../models/analyticsModel');
const customerModel = require('../models/customerQueueModel');
const organizationModel = require('../models/organizationModel');
const branchModel = require("../models/branchModel")

const calculateAverageWaitTime = (customers) => {
  if (!customers || customers.length === 0) return 0;

  const totalWaitTime = customers.reduce((acc, customer) => {
    if (!customer.joinTime || !customer.serviceEndTime) return acc;
    const waitTime =
      (new Date(customer.serviceEndTime) - new Date(customer.joinTime)) / 60000;
    return acc + (waitTime > 0 ? waitTime : 0);
  }, 0);

  return Math.round((totalWaitTime / customers.length) * 10) / 10;
};

exports.getBranchAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const org =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!org) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    const { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ✅ Query customers based on role
    let customers = [];
    if (org.role === "multi") {
      customers = await customerModel.find({
        branchId: id,
        joinTime: { $gte: start, $lte: end },
      });
    } else if (org.role === "individual") {
      customers = await customerModel.find({
        individualId: id,
        joinTime: { $gte: start, $lte: end },
      });
    } else {
      customers = await customerModel.find({
        branchId: id,
        joinTime: { $gte: start, $lte: end },
      });
    }

    // ✅ Count total customers correctly
    const totalCustomers = customers.length;

    // ✅ Average wait time
    const avgWaitTime = calculateAverageWaitTime(customers);

    // ✅ Weekly Volume Distribution
    const weeklyVolume = Array(7).fill(0);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    customers.forEach((customer) => {
      if (customer.joinTime) {
        const day = new Date(customer.joinTime).getDay();
        weeklyVolume[day]++;
      }
    });

    const weeklyCustomerVolume = days.map((day, index) => ({
      day,
      count: weeklyVolume[index],
    }));

    // ✅ Peak Hours
    const hours = Array(24).fill(0);
    customers.forEach((customer) => {
      if (customer.joinTime) {
        const hour = new Date(customer.joinTime).getHours();
        hours[hour]++;
      }
    });

    const peakHours = hours.map((count, hour) => ({
      hour,
      count,
    }));

    // ✅ Service Types Distribution
    const serviceTypes = {};
    customers.forEach((customer) => {
      const service =
        customer.formDetails?.serviceNeeded || customer.serviceNeeded;
      if (service) {
        serviceTypes[service] = (serviceTypes[service] || 0) + 1;
      }
    });

    const serviceTypesDistribution = Object.entries(serviceTypes).map(
      ([serviceType, count]) => ({
        serviceType,
        count,
      })
    );

    // ✅ Satisfaction Rate
    const satisfiedCustomers = customers.filter(
      (c) => c.servedAt && c.completedAt && c.status === "completed"
    ).length;

    // ✅ Save analytics snapshot
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

    // ✅ Final response
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
