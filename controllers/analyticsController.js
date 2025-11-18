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
    
    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    let customers = [];

    if (business.role === "branch") {
      customers = await customerModel.find({
        branchId: id,
        joinedAt: { $gte: start, $lte: end }
      });
    } else {
      customers = await customerModel.find({
        individualId: id,
        joinedAt: { $gte: start, $lte: end }
      });
    }

    const totalCustomers = customers.length;

    const avgWaitTime = calculateAverageWaitTime(
      customers.map(c => ({
        joinTime: c.joinedAt,
        serviceEndTime: c.servedAt
      }))
    );

 
    // Weekly Customer Volume
    // -----------------------------
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyVolume = days.map(day => ({
      day,
      count: customers.filter(
        c => new Date(c.joinedAt).getDay() === days.indexOf(day)
      ).length
    }));


    const waitTrend = days.map(day => {
      const dayCustomers = customers.filter(
        c => new Date(c.joinedAt).getDay() === days.indexOf(day)
      );

      const trendValue = calculateAverageWaitTime(
        dayCustomers.map(dc => ({
          joinTime: dc.joinedAt,
          serviceEndTime: dc.servedAt
        }))
      );

      return { day, value: trendValue };
    });


    const peakHours = ["10AM", "12PM", "2PM", "4PM"];
    const peakHourValues = peakHours.map(hour => {
      const targetHour = parseInt(hour);
      const count = customers.filter(
        c => new Date(c.joinedAt).getHours() === targetHour
      ).length;

      return { hour, count };
    });

    const colors = [
  "#4F46E5", 
  "#10B981", 
  "#F59E0B", 
 "#EF4444", 
 "#3B82F6", 
  "#8B5CF6", 
  "#14B8A6", 
   "#F43F5E" 
 ]

let colorIndex = 0;
    const serviceBucket = {};
    customers.forEach(c => {
      const service = c.formDetails?.serviceNeeded;
      if (service) serviceBucket[service] = (serviceBucket[service] || 0) + 1;
    });

    const serviceDistribution = Object.entries(serviceBucket).map(
      ([name, value]) =>{
        const color = colors[colorIndex % colors.length];
  colorIndex++;
  return { name, value, color };
      }
    );

    res.status(200).json({
      message: "Analytics fetched successfully",
      data: {
        totalCustomers,
        avgWaitTime,
        weeklyCustomerVolume: weeklyVolume,
        averageWaitTimeTrend: waitTrend,
        peakHours: peakHourValues,
        serviceTypeDistribution: serviceDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message
    });
  }
};
