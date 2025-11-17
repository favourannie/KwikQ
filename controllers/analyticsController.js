const analyticsModel = require('../models/analyticsModel');
const customerModel = require('../models/customerQueueModel');
const organizationModel = require('../models/organizationModel');
const branchModel = require("../models/branchModel")


// ✅ Average Wait Time Calculator
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

    // Identify if ID belongs to org or branch
    const org =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!org) {
      return res.status(404).json({ message: "Business not found" });
    }

    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch customers depending on business role
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

    // Average Wait Time
    const avgWaitTime = calculateAverageWaitTime(customers);

    // WEEKLY CUSTOMER VOLUME (Sun–Sat)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyVolume = Array(7).fill(0);

    customers.forEach((c) => {
      if (c.joinTime) weeklyVolume[new Date(c.joinTime).getDay()]++;
    });

    // Convert to desired format: [{ name: "Mon", value: 45 }, ...]
    const formattedWeeklyCustomerVolume = days.map((day, i) => ({
      name: day,
      value: weeklyVolume[i],
    }));

    // AVERAGE WAIT TIME TREND (Mon–Fri)
    const averageWaitTimeTrend = days.map((day, index) => {
      // Filter customers per day
      const dayCustomers = customers.filter((c) => {
        if (!c.joinTime || !c.serviceEndTime) return false;
        return new Date(c.joinTime).getDay() === index;
      });

      return {
        name: day,
        value: calculateAverageWaitTime(dayCustomers),
      };
    });

    // PEAK HOURS (0–23 → converted to Mon–Sun style for visualization)
    const hours = Array(24).fill(0);

    customers.forEach((c) => {
      if (c.joinTime) hours[new Date(c.joinTime).getHours()]++;
    });

    // Convert to your required format:
    // [{ name: "Mon", value: 65 }, ...]
    const peakHourAnalysis = days.map((day, i) => ({
      name: day,
      value: weeklyVolume[i], // daily peak usage is represented by volume per day
    }));

    // SERVICE TYPE DISTRIBUTION
    const serviceTypes = {};
    customers.forEach((c) => {
      const service =
        c.formDetails?.serviceNeeded || c.serviceNeeded;
      if (service) serviceTypes[service] = (serviceTypes[service] || 0) + 1;
    });

    const serviceTypeDistribution = Object.entries(serviceTypes).map(
      ([serviceType, count]) => ({
        name: serviceType,
        value: count,
      })
    );

    // SATISFACTION RATE
    const satisfiedCustomers = customers.filter(
      (c) => c.servedAt && c.completedAt && c.status === "completed"
    ).length;

    // Save analytics snapshot
    const analytics = await analyticsModel.create({
      organization: org._id,
      branch: id,
      date: new Date(),
      totalRequests: totalCustomers,
      satisfiedRequests: satisfiedCustomers,
      avgWaitTimeTrend: avgWaitTime,
      serviceTypesDistribution: serviceTypeDistribution,
      peakHours: peakHourAnalysis,
      weeklyCustomerVolume: [
        {
          weekStart: start,
          requestCount: totalCustomers,
        },
      ],
      topServices: serviceTypeDistribution
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    });

    // Final Response
    res.status(200).json({
      message: "Analytics fetched successfully",
      data: {
        totalCustomers,
        avgWaitTime,
        weeklyCustomerVolume: formattedWeeklyCustomerVolume,
        averageWaitTimeTrend,
        peakHourAnalysis,
        serviceTypeDistribution,
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

