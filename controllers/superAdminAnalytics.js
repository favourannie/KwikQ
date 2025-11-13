const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const Queue = require('../models/queueManagement'); 
const Service = require('../models/superAdmin');
const mongoose = require("mongoose");


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


exports.getServiceDistribution = async (req, res) => {
  try {
    const filter = {};

    // Validate and add organizationId filter
    const { orgId, branchId } = req.query;

    if (orgId) {
      if (mongoose.Types.ObjectId.isValid(orgId)) {
        filter.organizationId = new mongoose.Types.ObjectId(orgId);
      } else {
        return res.status(400).json({
          message: "Invalid organizationId format",
          error: "Expected a valid MongoDB ObjectId",
        });
      }
    }

    // Validate and add branchId filter
    if (branchId) {
      if (mongoose.Types.ObjectId.isValid(branchId)) {
        filter.branchId = new mongoose.Types.ObjectId(branchId);
      } else {
        return res.status(400).json({
          message: "Invalid branchId format",
          error: "Expected a valid MongoDB ObjectId",
        });
      }
    }

    // Aggregation pipeline
    const results = await Service.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$serviceType",
          totalCount: { $sum: "$count" },
        },
      },
    ]);

    if (!results || results.length === 0) {
      return res.status(200).json({
        summary: { totalServices: 0 },
        distribution: [],
      });
    }

    // Compute totals and percentages
    const total = results.reduce((sum, s) => sum + s.totalCount, 0);
    const distribution = results.map((s) => ({
      serviceType: s._id,
      count: s.totalCount,
      percentage: Number(((s.totalCount / total) * 100).toFixed(2)),
    }));

    res.status(200).json({
      summary: { totalServices: total },
      distribution,
    });
  } catch (error) {
    console.error("Error fetching service distribution:", error);
    res.status(500).json({
      message: "Failed to fetch service distribution",
      error: error.message,
    });
  }
};

exports.getBranchPerformance = async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId) {
      return res.status(400).json({
        message: "organizationId query parameter is required",
      });
    }

    const organization = await organizationModel.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const branches = await branchModel.find({ organizationId }, "_id branchName");
    if (!branches || branches.length === 0) {
      return res.status(404).json({ message: "No branches found for this organization" });
    }

    const branchData = await Promise.all(
      branches.map(async (branch) => {
        const customerCount = await CustomerInterface.countDocuments({ branchId: branch._id });
        return {
          branchId: branch._id,
          branchName: branch.branchName,
          customerCount,
        };
      })
    );

    const sortedBranches = branchData.sort((a, b) => b.customerCount - a.customerCount);
    const totalCustomers = sortedBranches.reduce((sum, b) => sum + b.customerCount, 0);

    const rankedBranches = sortedBranches.map((b, index) => ({
      rank: index + 1,
      branchName: b.branchName,
      customerCount: b.customerCount,
      percentage: totalCustomers ? ((b.customerCount / totalCustomers) * 100).toFixed(1) + "%" : "0%",
    }));

    const chartData = sortedBranches.map((b) => ({
      branchName: b.branchName,
      customerCount: b.customerCount,
    }));

    res.status(200).json({
      message: "Branch performance data fetched successfully",
      organizationId,
      totalBranches: rankedBranches.length,
      totalCustomers,
      chartData,
      branchRankings: rankedBranches,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching branch performance data",
      error: error.message,
    });
  }
};

exports.getBranchAnalytics = async (req, res) => {
  try {
    const orgId = req.user?.id;
    if (!orgId) {
      return res.status(401).json({ message: 'Organization ID required' });
    }

    const { branch = 'all', range = 'today' } = req.query;

    // Time range boundaries
    const now = moment();
    let start, end, prevStart, prevEnd;

    if (range === 'today') {
      start = now.clone().startOf('day');
      end = now.clone().endOf('day');
      prevStart = now.clone().subtract(1, 'day').startOf('day');
      prevEnd = now.clone().subtract(1, 'day').endOf('day');
    } else if (range === 'week') {
      start = now.clone().startOf('isoWeek');
      end = now.clone().endOf('isoWeek');
      prevStart = now.clone().subtract(1, 'week').startOf('isoWeek');
      prevEnd = now.clone().subtract(1, 'week').endOf('isoWeek');
    } else if (range === 'month') {
      start = now.clone().startOf('month');
      end = now.clone().endOf('month');
      prevStart = now.clone().subtract(1, 'month').startOf('month');
      prevEnd = now.clone().subtract(1, 'month').endOf('month');
    }

    const startDate = start.toDate();
    const endDate = end.toDate();
    const prevStartDate = prevStart.toDate();
    const prevEndDate = prevEnd.toDate();

    // Build base filter
    const baseFilter = {
      organizationId: orgId,
      createdAt: { $gte: startDate, $lte: endDate },
    };
    const prevFilter = {
      organizationId: orgId,
      createdAt: { $gte: prevStartDate, $lte: prevEndDate },
    };

    if (branch !== 'all') {
      baseFilter.branch = branch;
      prevFilter.branch = branch;
    }

    //Total Customers
    const totalCustomers = await Queue.countDocuments({
      ...baseFilter,
      status: 'Completed',
    });
    const prevTotal = await Queue.countDocuments({
      ...prevFilter,
      status: 'Completed',
    });
    const customerChange = prevTotal === 0
      ? totalCustomers > 0 ? '+100%' : '0%'
      : `${Math.round((totalCustomers - prevTotal) / prevTotal * 100)}%`;

    //Avg Wait Time
    const waitStats = await Queue.aggregate([
      { $match: { ...baseFilter, status: 'Completed', waitTime: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$waitTime' } } },
    ]);
    const avgWaitTime = waitStats[0]?.avg ? Math.round(waitStats[0].avg) : 0;

    const prevWaitStats = await Queue.aggregate([
      { $match: { ...prevFilter, status: 'Completed', waitTime: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$waitTime' } } },
    ]);
    const prevAvgWait = prevWaitStats[0]?.avg ? Math.round(prevWaitStats[0].avg) : 0;
    const waitImprovement = prevAvgWait === 0
      ? avgWaitTime < 60 ? '-100%' : '0%'
      : `${Math.round((prevAvgWait - avgWaitTime) / prevAvgWait * 100)}%`;

    //Weekly Customer Flow Trends (Mon–Sun)
    const trendData = await Queue.aggregate([
      {
        $match: {
          ...baseFilter,
          status: 'Completed',
        },
      },
      {
        $group: {
          _id: { $dateTrunc: { date: '$createdAt', unit: 'day' } },
          count: { $sum: 1 },
          avgWait: { $avg: '$waitTime' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Fill missing days
    const days = [];
    let current = start.clone();
    while (current <= end) {
      const dayStr = current.format('YYYY-MM-DD');
      const found = trendData.find(t => moment(t._id).format('YYYY-MM-DD') === dayStr);
      days.push({
        date: current.format('ddd'),
        customers: found?.count || 0,
        avgWait: found?.avgWait ? Math.round(found.avgWait) : 0,
      });
      current.add(1, 'day');
    }

    //Hourly Distribution (0–23)
    const hourlyData = await Queue.aggregate([
      {
        $match: {
          ...baseFilter,
          status: 'Completed',
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const hours = Array.from({ length: 24 }, (_, i) => {
      const found = hourlyData.find(h => h._id === i);
      return {
        hour: `${i}:00`,
        customers: found?.count || 0,
      };
    });

    //Branch List (for dropdown)
    const branches = await Branch.find({ organizationId: orgId })
      .select('_id branchName branchCode')
      .sort({ branchName: 1 })
      .lean();

    res.status(201).json({
      message:"Branch Analytics Fetched Successfully",
      summary: {
        totalCustomers: {
        count: totalCustomers,
        change: customerChange,
        comparison: range === 'today' ? 'vs yesterday' : `vs last ${range}`,
        trend: customerChange >= 0 ? 'up' : 'down'
  },
  avgWaitTime: {
    time: avgWaitTime,
    improvement: waitImprovement,
    label: "improvement",
    trend: waitImprovement < 0 ? 'up' : 'down' // less wait = better
  }
},
      trends: {
        labels: days.map(d => d.date),
        customers: days.map(d => d.customers),
        avgWait: days.map(d => d.avgWait),
      },
      hourly: {
        labels: hours.map(h => h.hour),
        customers: hours.map(h => h.customers),
      },
      filters: {
        branch: branch === 'all' ? 'All Branches' : branches.find(b => b._id.toString() === branch)?.branchName || 'Unknown',
        range,
      },
      branches: branches.map(b => ({
        id: b._id,
        name: `${b.branchName} (${b.branchCode})`,
      })),
      meta: {
        generatedAt: new Date(),
        range: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (error) {
    console.error('Branch Analytics Error:', error);
    res.status(500).json({
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};