const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const Queue = require('../models/queueManagement');

exports.getOverview = async (req, res) => {
  try {
    const totalOrganizations = await Organization.countDocuments();
    const totalBranches = await Branch.countDocuments();
    const totalActiveQueues = await Queue.countDocuments({ status: 'active' });

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const totalCustomersServedToday = await Queue.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$customersServed' } } }
    ]);

    const overviewData = {
      totalOrganizations,
      totalBranches,
      totalActiveQueues,
      totalCustomersServedToday: totalCustomersServedToday[0]?.total || 0,
      lastUpdated: new Date()
    };

    const updated = await SuperAdminDashboard.findOneAndUpdate(
      {},
      { overview: overviewData },
      { upsert: true, new: true }
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
