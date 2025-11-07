const SuperAdminDashboard = require('../models/superAdmin');
const Branch = require('../models/branchModel');
const Organization = require('../models/organizationModel');
const CustomerInterface = require('../models/customerQueueModel'); 
const Queue = require('../models/customerQueueModel');


exports.getBranchManagement = async (req, res) => {
 
   try {
    const { organizationId } = req.query; 

    
    const branchFilter = organizationId ? { organizationId } : {};

    const totalBranches = await Branch.countDocuments({organizationId:organizationId});

    const branches = await Branch.find({organizationId:organizationId});

    const branchIds = branches.map((b) => b._id);

    const totalActiveQueues = await Queue.countDocuments({
      branchId: { $in: branchIds },
      status: "active",
    });

    const avgWaitResult = await Queue.aggregate([
      { $match: { branchId: { $in: branchIds }, waitTime: { $gt: 0 } } },
      { $group: { _id: null, avgWait: { $avg: "$waitTime" } } },
    ]);
    const avgWaitTime = avgWaitResult.length > 0 ? Math.round(avgWaitResult[0].avgWait) : 0;

  
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalServedToday = await Queue.countDocuments({
      branchId: { $in: branchIds },
      status: "served",
      servedAt: { $gte: startOfDay },
    });


    return res.status(200).json({
      message: "Dashboard data fetched successfully",
      data: {
        totalBranches,
        totalActiveQueues,
        avgWaitTime: `${avgWaitTime} min`,
        totalServedToday,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return res.status(500).json({
      message: "Error fetching dashboard metrics",
      error: error.message,
    });
  }
};

exports.viewBranchReports = async (req, res) => {
  try {
    const { branchId } = req.params;

    let branches = [];

    if (branchId) {
      // Validate and get single branch
      const branch = await Branch.findById(branchId)
        .populate('organization', 'branchName')
        .lean();

      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      branches = [branch];
    } else {
      // Get all branches
      branches = await Branch.find()
        .populate('organization', 'branchName')
        .lean();
    }

    // Build reports for each branch
    const reports = await Promise.all(
      branches.map(async branch => {
        const totalCustomers = await CustomerInterface.countDocuments({ branch: branch._id });
        const servedCustomers = await CustomerInterface.countDocuments({
          branch: branch._id,
          status: 'served',
        });

        return {
          branchId: branch._id,
          branchName: branch.branchName,
          organizationName: branch.organization?.organizationName,
          totalCustomers,
          servedCustomers,
          pendingCustomers: totalCustomers - servedCustomers,
          avgWaitTime: branch.avgWaitTime || 0,
          queuesToday: branch.queuesToday || 0,
          lastLogin: branch.lastLogin,
          status: branch.status,
        };
      })
    );

    // Compute overall analytics if all branches requested
    if (!branchId) {
      const totalBranches = reports.length;
      const totalCustomers = reports.reduce((sum, r) => sum + r.totalCustomers, 0);
      const totalServed = reports.reduce((sum, r) => sum + r.servedCustomers, 0);
      const avgWaitTime =
        totalBranches > 0
          ? reports.reduce((sum, r) => sum + (r.avgWaitTime || 0), 0) / totalBranches
          : 0;

      return res.status(200).json({
        message: 'All branch reports fetched successfully',
        overview: {
          totalBranches,
          totalCustomers,
          totalServed,
          avgWaitTime: Number(avgWaitTime.toFixed(2)),
        },
        reports,
      });
    }

    // Single branch response
    res.status(200).json({
      message: 'Branch report fetched successfully',
      report: reports[0],
    });
  } catch (error) {
    console.error('Error in viewBranchReports:', error);
    res.status(500).json({
      message: 'Error fetching branch report(s)',
      error: error.message,
    });
  }
};


exports.getBranchById = async (req, res) => {
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

    const branch = await Branch.find({organizationId:organizationId})
    console.log('BRANCH:', branch)

    return res.status(200).json({
      message: 'Branches with analytics fetched successfully',
      branch
      // totalBranches: enrichedBranches.length,
      // data: enrichedBranches,
    });
  } catch (error) {
    console.error('Error fetching branches with stats:', error);
    return res.status(500).json({
      message: 'Error fetching branches with stats',
      error: error.message,
    });
  }
};