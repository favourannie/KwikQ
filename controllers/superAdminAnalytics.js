const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const Queue = require('../models/queueManagement'); // optional if queue data included


exports.getAnalytics = async (req, res) => {
  try {
    
    const organizations = await Organization.find().select('name createdAt');

    // Fetch all branches with organization reference
    const branches = await Branch.find()
      .populate('organization', 'name')
      .select('branchName city organization');

    // Optionally fetch queues for deeper analytics
    const queues = await Queue.find().populate('branch organization', 'branchName name');

    const analyticsSummary = {
      totalOrganizations: organizations.length,
      totalBranches: branches.length,
      totalQueues: queues.length,
      organizationAnalytics: await Promise.all(
        organizations.map(async (org) => {
          const orgBranches = branches.filter(
            (b) => b.organization && b.organization._id.toString() === org._id.toString()
          );

          const branchIds = orgBranches.map((b) => b._id);
          const orgQueues = queues.filter((q) =>
            branchIds.includes(q.branch?._id?.toString())
          );

          return {
            organizationId: org._id,
            organizationName: org.name,
            totalBranches: orgBranches.length,
            totalQueues: orgQueues.length,
            branches: orgBranches.map((b) => ({
              branchId: b._id,
              branchName: b.branchName,
              city: b.city,
              queueCount: orgQueues.filter(
                (q) => q.branch?._id?.toString() === b._id.toString()
              ).length,
            })),
          };
        })
      ),
    };

    // Optionally update dashboard model
    const updatedDashboard = await SuperAdminDashboard.findOneAndUpdate(
      {},
      { analytics: analyticsSummary },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Fetched all analytics successfully.',
      analytics: updatedDashboard.analytics,
    });
  } catch (error) {
    res.status(500).json({
    message:"Error fetching Analytics",
    error: error.message
    });
  }
};


exports.createAnalytics = async (req, res) => {
  try {
    const { analytics } = req.body;

    const updatedDashboard = await SuperAdminDashboard.findOneAndUpdate(
      {},
      { analytics },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'Analytics created successfully.',
      analytics: updatedDashboard.analytics,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating Analytics',
    });
  }
};

exports.updateAnalytics = async (req, res) => {
  try {
    const { analytics } = req.body;

    const updatedDashboard = await SuperAdminDashboard.findOneAndUpdate(
      {},
      { $set: { analytics } },
      { new: true }
    );

    res.status(200).json({
      message: 'Analytics updated successfully.',
      analytics: updatedDashboard.analytics,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating Analytics',
      error: error.message,
    });
  }
};


exports.deleteAnalytics = async (req, res) => {
  try {
    const clearedDashboard = await SuperAdminDashboard.findOneAndUpdate(
      {},
      { $unset: { analytics: 1 } },
      { new: true }
    );

    res.status(200).json({
      message: 'Analytics section cleared successfully.',
      cleared: clearedDashboard,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting Analytics',
      error:  error.message,
    });
  }
};
