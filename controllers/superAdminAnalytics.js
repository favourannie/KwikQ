const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const Queue = require('../models/queueManagement'); 


// const Queue = require('../models/queueModel');
const Customer = require('../models/customerQueueModel');
const moment = require('moment');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const filter = organizationId ? { organizationId } : {};

    //Total Customers This Week
    const startOfWeek = moment().startOf('isoWeek').toDate();
    const endOfWeek = moment().endOf('isoWeek').toDate();

    const totalCustomersThisWeek = await Customer.find({
      ...filter,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const totalCustomersLastWeek = await Customer.find({
      ...filter,
      createdAt: {
        $gte: moment(startOfWeek).subtract(7, 'days').toDate(),
        $lte: moment(endOfWeek).subtract(7, 'days').toDate(),
      },
    });

    const customerChangePercent =
      totalCustomersLastWeek > 0
        ? (((totalCustomersThisWeek - totalCustomersLastWeek) /
            totalCustomersLastWeek) *
            100).toFixed(1)
        : 0;

    // Average Wait Time
    const waitTimes = await Queue.aggregate([
      { $match: { ...filter, status: 'served' } },
      {
        $group: {
          _id: null,
          avgWait: { $avg: '$waitTime' },
        },
      },
    ]);

    const avgWaitTime = waitTimes.length > 0 ? waitTimes[0].avgWait : 0;

    // Customer Flow Trends (Mon–Sun)
    const trends = await Customer.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          totalCustomers: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Format for frontend chart
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const customerTrends = daysOfWeek.map((day, i) => {
      const record = trends.find(t => t._id === i + 2 || (i === 6 && t._id === 1));
      return {
        day,
        totalCustomers: record ? record.totalCustomers : 0,
        avgWait: Math.floor(Math.random() * 10) + 5, // placeholder wait time per day
      };
    });


    res.status(200).json({
      message: 'Dashboard metrics fetched successfully',
      totalCustomers: totalCustomersThisWeek,
      customerChangePercent,
      avgWaitTime: avgWaitTime.toFixed(0),
      trends: customerTrends,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      message: 'Error fetching dashboard metrics',
      error: error.message,
    });
  }
};

exports.getFilteredDashboardData = async (req, res) => {
  try {
    const { organizationId, timeRange } = req.query;

  
    const filter = {};
    if (organizationId && organizationId !== 'all') {
      filter.organizationId = organizationId;
    }

    // Determine the time range
    let startDate, endDate;
    const today = moment().endOf('day');

    switch (timeRange) {
      case 'today':
        startDate = moment().startOf('day');
        endDate = today;
        break;
      case 'thisWeek':
        startDate = moment().startOf('isoWeek');
        endDate = moment().endOf('isoWeek');
        break;
      case 'thisMonth':
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        break;
      default:
        startDate = moment().startOf('day');
        endDate = today;
        break;
    }

    const totalCustomers = await Customer.find({
      ...filter,
      createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    });

    // Average Wait Time (in minutes) 
    const waitTimeData = await Queue.aggregate([
      {
        $match: {
          ...filter,
          status: 'served',
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        },
      },
      {
        $group: {
          _id: null,
          avgWaitTime: { $avg: '$waitTime' },
        },
      },
    ]);

    const avgWaitTime =
      waitTimeData.length > 0 ? Math.round(waitTimeData[0].avgWaitTime) : 0;

    const trends = await Customer.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          totalCustomers: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const customerTrends = daysOfWeek.map((day, i) => {
      const match = trends.find(t => t._id === i + 1);
      return {
        day,
        totalCustomers: match ? match.totalCustomers : 0,
      };
    });


    res.status(200).json({
      message: 'Dashboard data fetched successfully',
      organizationId: organizationId || 'all',
      timeRange: timeRange || 'today',
      totalCustomers,
      avgWaitTime,
      trends: customerTrends,
    });
  } catch (error) {
    console.error('Error fetching filtered dashboard data:', error);
    res.status(500).json({
      message: 'Error fetching filtered dashboard data',
      error: error.message,
    });
  }
};