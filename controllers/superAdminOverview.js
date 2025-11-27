
const jwt = require("jsonwebtoken");
const Billing = require('../models/billing');
const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const Queue = require('../models/queueManagement');
const Service = require('../models/superAdmin');
const mongoose = require("mongoose");

// const Queue = require('../models/queueModel');
const Customer = require('../models/customerQueueModel');
const moment = require('moment')
const CustomerInterface = require('../models/customerQueueModel'); 

exports.getOverview = async (req, res) => {
  try {
    
    const totalOrganizations = await Organization.countDocuments();
    const totalBranches = await Branch.countDocuments();
    const totalActiveQueues = await Queue.countDocuments({ status: 'active' });

    // Calculate today's start and end
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Sum customers served today
    const totalCustomersServedTodayAgg = await Queue.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$customersServed' },
        },
      },
    ]);

    const totalCustomersServedToday =
      totalCustomersServedTodayAgg.length > 0
        ? totalCustomersServedTodayAgg[0].total
        : 0;

    // Fetch detailed branch info (optional)
    const branchDetails = await Branch.find()
      .populate('organizationId', 'organizationName contactEmail contactPhone')
      .select('branchName city state manager');

    const overviewData = {
      totalOrganizations,
      totalBranches,
      totalActiveQueues,
      totalCustomersServedToday,
      branchDetails,
      lastUpdated: new Date(),
    };

    // Update or create dashboard record
    const updated = await SuperAdminDashboard.findOneAndUpdate(
      {},
      { overview: overviewData },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Overview updated successfully',
      overview: updated.overview,
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      message: 'Error updating overview',
      error: error.message,
    });
  }
};

exports.updateOverview = async (req, res) => {
  try {
    const { overview } = req.body;
    const updated = await SuperAdminDashboard.findOneAndUpdate(
      {},
      { overview },
      { new: true }
    );
    res.status(200).json({ 
        message: 'Overview updated successfully', 
        overview: updated.overview 
    });
  } catch (error) {
    res.status(500).json({ 
        message: 'Error updating overview', 
        error: error.message 
    });
  }
};


exports.getOrganizationSettings = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('branches', 'branchName city state managerEmail')
      .lean();

    const organizationSettings = organizations.map(org => ({
      organizationId: org._id,
      organizationName: org.organizationName || org.name,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      website: org.website,
      taxId: org.taxId,
      headOfficeAddress: org.headOfficeAddress,
      industryType: org.industryType
    }));

    // Update Super Admin Dashboard
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      { organizationSettings },
      { upsert: true, new: true }
    );
    await organizationSettings.save();

    res.status(200).json({
      message: 'Organization settings fetched successfully',
      organizationSettings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization settings', error: error.message });
  }
};

exports.getAllBranchManagers = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate('organization', 'organizationName')
      .select('branchName managerEmail managerPhone address')
      .lean();

    if (!branches.length) {
      return res.status(404).json({ message: 'No branches or managers found' });
    }

    const managerRoles = branches.map(branch => ({
      branchId: branch._id,
      branchName: branch.branchName,
      managerName: branch.manager,
      managerEmail: branch.email,
      managerPhone: branch.phoneNumber,
      organizationName: branch.organization?.organizationName || 'Unknown Organization',
    }));

    res.status(200).json({
      message: 'All branch managers fetched successfully',
      totalManagers: managerRoles.length,
      managers: managerRoles,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching branch managers',
      error: error.message,
    });
  }
};


exports.updateSettings = async (req, res) => {
  try {
    const { organizationId } = req.body;
    const updateData = req.body;

    const updatedSettings = await SuperAdminDashboard.findOneAndUpdate(
      { organizationId },
      updateData,
      { new: true, upsert: true }
    );
      await 
    res.status(200).json({
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const settings = await SuperAdminDashboard.findOne({ organizationId });

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    res.status(200).json({
      message: 'Settings fetched successfully',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};


exports.addCardMethod = async (req, res) => {
  try {
    const organizationId = req.user.Id; 
    const { cardNumber, expiryDate, cardHolderName, cardType, cvv } = req.body;


    if (!cardNumber || !expiryDate || !cardHolderName || !cardType) {
      return res.status(400).json({ message: 'Missing required card details' });
    }

    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!dateRegex.test(expiryDate)) {
      return res.status(400).json({
        message: 'Invalid expiry date format. Use MM/DD/YYYY (e.g. 10/31/2027)',
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const newCard = {
      cardHolderName,
      cardType,
      last4: cardNumber.slice(-4),
      expiryDate,
      cvv,
      addedAt: new Date(),
    };

    // Initialize billing info if missing
    organization.billingInfo = organization.billingInfo || {};
    organization.billingInfo.cards = organization.billingInfo.cards || [];
    organization.billingInfo.cards.push(newCard);

    await organization.save();

    res.status(201).json({
      message: 'Card method added successfully',
      cards: organization.billingInfo.cards,
    });
  } catch (error) {
    console.error('Error in addCardMethod:', error);
    res.status(500).json({
      message: 'Error adding card method',
      error: error.message,
    });
  }
};


exports.updateCardMethod = async (req, res) => {
  try {
    const { organizationId, cardId } = req.body;
    const updateData = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const card = organization.billingInfo?.cards?.id(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    Object.assign(card, updateData);
    await organization.save();

    res.status(200).json({
      message: 'Card updated successfully',
      card,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating card', error: error.message });
  }
};

exports.removeCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { organizationId } = req.query;
    if (!organizationId) return res.status(400).json({ message: 'organizationId required' });

    const pm = await PaymentMethod.findOneAndDelete({ _id: cardId, organizationId });
    if (!pm) return res.status(404).json({ message: 'Card not found' });

    // If it was default, try set another card to default
    if (pm.isDefault) {
      const another = await PaymentMethod.findOne({ organizationId }).sort({ createdAt: -1 });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }

    // TODO: if using provider, detach or delete payment method in provider using pm.stripePaymentMethodId

    return res.json({ message: 'Card removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error removing card', error: err.message });
  }
};


exports.getBillingHistory = async (req, res) => {
  try {
    const { Id } = req.user.Id;
    const billingHistory = await Billing.find({ organization:Id }).sort({ createdAt: -1 });

    if (!billingHistory.length) {
      return res.status(404).json({ message: 'No billing history found' });
    }

    res.status(200).json({
      message: 'Billing history fetched successfully',
      totalTransactions: billingHistory.length,
      billingHistory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching billing history', error: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { organizationId } = req.query;
    if (!organizationId) return res.status(400).json({ message: 'organizationId required' });

    const invoices = await Billing.find({ organizationId }).sort({ issuedAt: -1 }).lean();

    await invoices.save();
    return res.json({ message: 'Invoices fetched', invoices });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Billingilling.findById(id).lean();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

   
    if (invoice.downloadUrl) {
      return res.json({ downloadUrl: invoice.downloadUrl });
     
    } else {
      return res.status(404).json({ message: 'Download not available' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error downloading invoice', error: err.message });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const updatedOrganization = await Organization.findByIdAndUpdate(
      req._id,
      req.body,
      { new: true }
    );

    if (!updatedOrganization)
      return res.status(404).json({ message: 'Organization not found' });

    // Re-sync dashboard
    const organizations = await Organization.find();
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      { organizationSettings: organizations},
      { upsert: true }
    );

    res.status(200).json({
      message: 'Organization updated successfully',
      updatedOrganization,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization', error: error.message });
  }
};


exports.getBranchesByOrganization = async (req, res) => {
  try {
    const branches = await Branch.find({ organization: req.params.id })
      .populate("organization", "organizationName", "city",
      "state",
      "branchName",
      "address",
      "serviceType",
      "managerName",
      "managerEmail",
      "managerPhone")
      .lean();

    if (!branches || branches.length === 0)
      return res.status(404).json({  message: 'No branches found for this organization' });

    res.status(200).json({
     message: 'Branches fetched successfully',
      organizationId: req.params.id,
      totalBranches: branches.length,
      branches,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
};

exports.getAllBranches = async (req, res) => {
  try {
    const filter = {};
    if (req.query.organization) {
      filter.organization = req.query.organization;
    }

    const branches = await Branch.find(filter)
      .populate("organization", "organizationName", "city",
      "state",
      "branchName",
      "address",
      "serviceType",
      "managerName",
      "managerEmail",
      "managerPhone")
      .lean();

    res.status(200).json({
      message: 'Branches fetched successfully',
      totalBranches: branches.length,
      branches,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
};
exports.getBranchById = async (req, res) => {
  try {
    const { Id } = req.user.Id;

    if (!Id || Id.length !== 24) {
      return res.status(400).json({ message: "Invalid branch ID format" });
    }

    const branch = await Branch.findById(Id)
      .populate('organization', 'managerName managerEmail branchCode')
      .lean();

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.status(200).json({
      message: 'Branch fetched successfully',
      branch,
    });
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({
      message: 'Error fetching branch',
      error: error.message,
    });
  }
};


exports.changeSubscriptionPlan = async (req, res) => {
  try {
    const { Id } = req.user.Id;
    const { newPlan, paymentMethod, amount, duration } = req.body;

    const organization = await Organization.findById(Id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.subscriptionDetails?.plan === newPlan) {
      return res.status(400).json({ message: `Already on ${newPlan} plan.` });
    }

    const oldPlan = organization.subscriptionDetails?.plan || 'None';

    organization.subscriptionDetails = {
      plan: newPlan,
      paymentMethod: paymentMethod || organization.subscriptionDetails?.paymentMethod || 'card',
      amount: amount || organization.subscriptionDetails?.amount || 0,
      duration: duration || organization.subscriptionDetails?.duration || 'monthly',
      startDate: new Date(),
      expiryDate:
        duration === 'yearly'
          ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: 'active',
      lastUpdated: new Date(),
    };

    await organization.save();

    await Billing.create({
      organization: organization._id,
      amount: organization.subscriptionDetails.amount,
      currency: 'NGN',
      method: paymentMethod || 'card',
      transactionId: `TX-${Date.now()}`,
      description: `Subscription plan changed from ${oldPlan} to ${newPlan}`,
      status: 'success',
    });

    res.status(200).json({
      message: `Subscription plan changed successfully from ${oldPlan} to ${newPlan}`,
      subscriptionDetails: organization.subscriptionDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error changing subscription plan',
      error: error.message,
    });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const { organizationId } = req.body;

    await Organization.findByIdAndDelete(organizationId);
    await SuperAdminDashboard.findOneAndDelete({ organizationId });

    res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting organization', error: error.message });
  }
};


;

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


exports.getBranchManagement = async (req, res) => {
try {
    const orgId = req.user?.id;
    if (!orgId) {
      return res.status(401).json({ message: 'Organization ID required' });
    }

    const today = moment().startOf('day').toDate();
    const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
    const thisMonth = moment().startOf('month').toDate();

    const totalBranches = await Branch.countDocuments({ organizationId: orgId });
    const totalThisMonth = await Branch.countDocuments({
      organizationId: orgId,
      createdAt: { $gte: thisMonth },
    });

    const activeQueues = await Queue.countDocuments({
      branch: { $in: await Branch.find({ organizationId: orgId }).distinct('_id') },
      status: { $in: ['waiting', 'serving'] },
    });

    const completedToday = await Queue.find({
      branch: { $in: await Branch.find({ organizationId: orgId }).distinct('_id') },
      status: 'completed',
      completedAt: { $gte: today },
    }).select('waitStartTime serveStartTime completedAt');

    let avgWaitTimeMinutes = 0;
    if (completedToday.length > 0) {
      const totalWaitSeconds = completedToday.reduce((sum, q) => {
        const start = q.serveStartTime || q.waitStartTime;
        const end = q.completedAt;
        return sum + (end - start) / 1000;
      }, 0);
      avgWaitTimeMinutes = Math.round(totalWaitSeconds / 60 / completedToday.length);
    }

    const servedToday = await Queue.countDocuments({
      branch: { $in: await Branch.find({ organizationId: orgId }).distinct('_id') },
      status: 'completed',
      completedAt: { $gte: today },
    });

    const branchIds = await Branch.find({ organizationId: orgId }).distinct('_id');

    const servedYesterday = await Queue.countDocuments({
      branch: { $in: branchIds },
      status: 'completed',
      completedAt: { $gte: yesterday, $lt: today },
    });
    const servedChange = servedYesterday === 0
      ? servedToday > 0 ? '+∞%' : '0%'
      : `${Math.round((servedToday - servedYesterday) / servedYesterday * 100)}%`;

    const activeQueuesYesterday = await Queue.countDocuments({
      branch: { $in: branchIds },
      status: { $in: ['waiting', 'serving'] },
      createdAt: { $gte: yesterday, $lt: today },
    });
    const activeChange = activeQueuesYesterday === 0
      ? activeQueues > 0 ? '+∞%' : '0%'
      : `${Math.round((activeQueues - activeQueuesYesterday) / activeQueuesYesterday * 100)}%`;

    const branches = await Branch.find({ organizationId: orgId }).sort({ branchName: 1 });
    const branchStats = await Promise.all(
      branches.map(async (branch) => {
        const [active, served, avgWait] = await Promise.all([
          Queue.countDocuments({
            branch: branch._id,
            status: { $in: ['waiting', 'serving'] },
          }),
          Queue.countDocuments({
            branch: branch._id,
            status: 'completed',
            completedAt: { $gte: today },
          }),
          Queue.aggregate([
            {
              $match: {
                branch: branch._id,
                status: 'completed',
                completedAt: { $gte: today },
              },
            },
            {
              $project: {
                waitTime: {
                  $divide: [
                    { $subtract: ['$completedAt', { $ifNull: ['$serveStartTime', '$waitStartTime'] }] },
                    60000,
                  ],
                },
              },
            },
            { $group: { _id: null, avg: { $avg: '$waitTime' } } },
          ]),
        ]);

        return {
          _id: branch._id,
          branchName: branch.branchName,
          branchCode: branch.branchCode,
          city: branch.city,
          state: branch.state,
          address: branch.address,
          managerName: branch.managerName,
          status: branch.status,
          lastUpdated: branch.lastUpdated,
          activeQueue: active,
          servedToday: served,
          avgWaitTime: avgWait[0]?.avg ? Math.round(avgWait[0].avg) : 0,
        };
      })
    );

    res.status(201).json({
    message: "Branches Overview Successfully Fetched",
        summary: {
        totalBranches: totalBranches,
        totalBranchesChange: `+${totalThisMonth} this month`,

        activeQueues: activeQueues,
        activeQueuesChange: `${activeChange >= 0 ? '+' : ''}${activeChange} from yesterday`,

        avgWaitTime: `${avgWaitTimeMinutes} min`,

         servedToday: servedToday,
         servedTodayChange: `${servedChange >= 0 ? '+' : ''}${servedChange} from yesterday`
        },
      branches: branchStats,
      meta: {
        generatedAt: new Date(),
        organizationId: orgId,
        activeCount: branchStats.filter(b => b.status === 'Active').length,
        offlineCount: branchStats.filter(b => b.status === 'Offline').length,
      },
    });
  } catch (error) {
    console.error('Branch Management Error:', error);
    res.status(500).json({
      message: 'Error fetching branches Overview',
      error: err.message,
    });
  }
};

 
//    try {
//     const  organizationId  = req.params.id; 

//     const branchFilter = organizationId ? { organizationId } : {};

//     const branches = await Branch.find({organizationId:organizationId});
//     console.log(branches);
    

//     const totalBranches = branches.length
//     let stuff
//     let totalactiveQ = 0
//     let avgWaitTime
//     let Waittime 
//     let num = []
//     for (const x of branches) {
//   const stuff = await Queue.find({ branchId: x._id });
//   num.push(stuff);

//   if (stuff) {
//     totalactiveQ += stuff.length;
//   }
// }

// console.log(num, totalactiveQ);
    // avgWaitTime = Waittime / totalactiveQ


    // const branchId = branches.map((b) => b._id);

    // // 2️⃣ Total Active Queues
    // const totalActiveQueues = await Queue.find({
    //   branchId: { $in: branchId },
    //   status: "active",
    // });

    // // 3️⃣ Average Wait Time (all queues)
    // const avgWaitResult = await Queue.aggregate([
    //   { $match: { branchId: { $in: branchId }, waitTime: { $gt: 0 } } },
    //   { $group: { _id: null, avgWait: { $avg: "$waitTime" } } },
    // ]);
    // // const avgWaitTime = avgWaitResult.length > 0 ? Math.round(avgWaitResult[0].avgWait) : 0;

    // // 4️⃣ Total Served Today
    // const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    // const totalServedToday = await Queue.findOne({
    //   branchId: { $in: branchId },
    //   status: "served",
    //   servedAt: { $gte: startOfDay },
    // });

    // // ✅ Return final metrics
//     return res.status(200).json({
//       message: "Dashboard data fetched successfully",
//       branches,
//       num
//       // data: {
//       //   totalBranches,
//       //   totalActiveQueues,
//       //   avgWaitTime: `${avgWaitTime} min`,
//       //   totalServedToday,
//       // },
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard metrics:", error);
//     return res.status(500).json({
//       message: "Error fetching dashboard metrics",
//       error: error.message,
//     });
//   }
// };

// Get all branches
exports.getBranches = async (req, res) => {
  try {
    const organizationId = req.params.id
    const branches = await Branch.find(organizationId);
    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Failed to fetch branches", error: error.message });
  }
};



// Get all branches in one organization
exports.getAllBranch = async (req, res) => {
  try {
    const orgId = req.query;
    console.log(orgId)

    const branches = await Branch.find(orgId).select(
      "managerName status avgWaitTime servedToday activeQueue"
    );

    const formattedBranches = branches.map(branch => ({
     
      managerName: branch.managerName,
      status: branch.status,
      avgWaitTime: branch.avgWaitTime,
      servedToday: branch.servedToday,
      activeQueue: branch.activeQueue
    }));

    res.status(200).json(formattedBranches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ message: "Failed to fetch branches", error: error.message });
  }
};


exports.getBranchByIds = async (req, res) => {
  try {
    const { Id } = req.user.Id; 
    const adminId = req.user.id; 

    const admin = await Organization.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found or unauthorized" });
    }

  
    const branch = await Branch.findOne({
      _id: Id,
      organizationId: admin._id,
    })
      .populate('organizationId', 'organizationName managerName managerEmail branchCode')
      .lean();

    if (!branch) {
      return res.status(404).json({ message: "Branch not found or not part of your organization" });
    }

    return res.status(200).json({
      message: "Branch fetched successfully",
      data: branch,
    });

  } catch (error) {
    console.error("Error fetching branch:", error);
    return res.status(500).json({
      message: "Error fetching branch",
      error: error.message,
    });
  }
};


exports.getAllBranchesWithStats = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const branches = await Branch.find({ organizationId : organizationId});
   
    const enrichedBranches = await Promise.all(
      branches.map(async (branch) => {
        
        const activeQueue = await Queue.countDocuments({
          branchId: branch._id,
          status: 'waiting', // or whatever status means "in queue"
        });

        const servedToday = await Queue.countDocuments({
          branchId: branch._id,
          status: 'served',
          servedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // start of today
            $lt: new Date(new Date().setHours(23, 59, 59, 999)), // end of today
          },
        });

        const avgWaitAgg = await Queue.aggregate([
          {
            $match: {
              branchId: branch._id,
              status: 'served',
              servedAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          },
          { $group: {_id: null, avgWait: { $avg: '$waitTime' }, // assuming you store wait time in minutes or seconds
            },
          },
        ]);

        const avgWait = avgWaitAgg.length > 0 ? avgWaitAgg[0].avgWait : 0;
        return {
          ...branch.toObject(),
          activeQueue,
          avgWait,
          servedToday,
        };
      })
    );

    return res.status(200).json({
      message: 'Branches with analytics fetched successfully',
      totalBranches: enrichedBranches.length,
      branches: enrichedBranches,
    });
  } catch (error) {
    console.error('Error fetching branches with stats:', error);
    return res.status(500).json({
      message: 'Error fetching branches with stats',
    });
  }
};


// exports.viewBranchReports = async (req, res) => {
//  try {
//     const { organizationId } = req.params.id; // ✅ fixed destructuring
//     let branches = [];

//     if (organizationId) {
//       // ✅ Find branches belonging to one organization
//       branches = await Branch.find({ organizationId: organizationId })
//         .populate('organizationId', 'organizationName') // ✅ fixed populate path
//         .lean();

//       if (!branches.length) {
//         return res.status(404).json({ message: 'No branches found for this organization' });
//       }
//     } 
//     // else {
//     //   // ✅ Get all branches
//     //   branches = await Branch.find()
//     //     .populate('organizationId', 'organizationName')
//     //     .lean();
//     // }

//     // ✅ Build reports for each branch
//     const reports = await Promise.all(
//       branches.map(async (branch) => {
//         const totalCustomers = await CustomerInterface.countDocuments({
//           branch: branch._id,
//         });
//         const servedCustomers = await CustomerInterface.countDocuments({
//           branch: branch._id,
//           status: 'served',
//         });

//         return {
//           branchId: branch._id,
//           branchName: branch.branchName,
//           organizationName: branch.organizationId?.organizationName ,
//           totalCustomers,
//           servedCustomers,
//           pendingCustomers: totalCustomers - servedCustomers,
//           avgWaitTime: branch.avgWaitTime || 0,
//           queuesToday: branch.queuesToday || 0,
//           lastLogin: branch.lastLogin,
//           status: branch.status,
//         };
//       })
//     );

//     // ✅ Overall analytics if all branches requested
//     if (!organizationId) {
//       const totalBranches = reports.length;
//       const totalCustomers = reports.reduce((sum, r) => sum + r.totalCustomers, 0);
//       const totalServed = reports.reduce((sum, r) => sum + r.servedCustomers, 0);
//       const avgWaitTime =
//         totalBranches > 0
//           ? reports.reduce((sum, r) => sum + (r.avgWaitTime || 0), 0) / totalBranches
//           : 0;

//       // return res.status(200).json({
//       //   message: 'All branch reports fetched successfully',
//       //   overview: {
//       //     totalBranches,
//       //     totalCustomers,
//       //     totalServed,
//       //     avgWaitTime: Number(avgWaitTime.toFixed(2)),
//       //   },
    
//       // });
//     }

//     // ✅ Single organization response
//     res.status(200).json({
//       message: 'Branch reports fetched successfully',
//       reports,
//     });
//   } catch (error) {
//     console.error('Error in viewBranchReports:', error);
//     res.status(500).json({
//       message: 'Error fetching branch report(s)',
//       error: error.message,
//     });
//   }
// };
