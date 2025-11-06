const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const Queue = require('../models/queueManagement');

exports.getOverview = async (req, res) => {
  try {
    // Count totals
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
