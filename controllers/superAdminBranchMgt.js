const SuperAdminDashboard = require('../models/superAdmin');
const Branch = require('../models/branchModel');
const Organization = require('../models/organizationModel');
const CustomerInterface = require('../models/customerQueueModel'); 
const Queue = require('../models/customerQueueModel');


exports.getBranchManagement = async (req, res) => {
  try {
    const { dashboardId } = req.params;

    // Validate dashboardId
    if (!dashboardId) {
      return res.status(400).json({ message: 'Dashboard ID is required' });
    }

    // Check if dashboard exists
    let dashboard = await SuperAdminDashboard.findById(dashboardId);
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Fetch totals dynamically
    const totalBranches = await Branch.countDocuments();
    const totalActiveQueues = await Queue.countDocuments({ status: 'active' });

    // Customers served today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const totalCustomersServedToday = await Customer.countDocuments({
      status: 'served',
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Average wait time
    const queues = await Queue.find({ avgWaitTime: { $exists: true } });
    let avgWaitTime = 0;
    if (queues.length > 0) {
      const totalWaitTime = queues.reduce((acc, q) => acc + (q.avgWaitTime || 0), 0);
      avgWaitTime = totalWaitTime / queues.length;
    }

    // Update dashboard
    dashboard.overview.totalBranches = totalBranches;
    dashboard.overview.totalActiveQueues = totalActiveQueues;
    dashboard.overview.totalCustomersServedToday = totalCustomersServedToday;
    dashboard.overview.avgWaitTime = avgWaitTime;
    dashboard.overview.lastUpdated = new Date();

    await dashboard.save();

    return res.status(200).json({
      message: 'Super admin dashboard data fetched successfully',
      dashboardId: dashboard._id,
      data: dashboard.overview,
    });
  } catch (error) {
    console.error('Error fetching super admin dashboard:', error);
    return res.status(500).json({
      message: 'Error fetching super admin dashboard data',
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
    const { organizationId, status } = req.query;

    // Build dynamic filter
    const filter = {};
    if (organizationId) filter.organizationId = organizationId;
    if (status) filter.status = status;

    // Fetch all branches and populate organization info
    const branches = await Branch.find(filter)
      .populate('organizationId', 'managerName managerEmail brancCode phoneNumber')
      .sort({ createdAt: -1 })
      .lean();

    if (!branches || branches.length === 0) {
      return res.status(404).json({ message: 'No branches found' });
    }

    // Set up time range for "today"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Process each branch
    const enrichedBranches = await Promise.all(
      branches.map(async (branch) => {
        // Count active queues for this branch
        const activeQueuesCount = await Queue.countDocuments({
          branchId: branch._id,
          status: 'active',
        });

        // Get queues with avg wait time
        const queues = await Queue.find({ branchId: branch._id, avgWaitTime: { $exists: true } });
        let avgWaitTime = 0;
        if (queues.length > 0) {
          const totalWaitTime = queues.reduce((acc, q) => acc + (q.avgWaitTime || 0), 0);
          avgWaitTime = totalWaitTime / queues.length;
        }

        // Customers served today
        const totalServedToday = await Customer.countDocuments({
          branchId: branch._id,
          status: 'served',
          updatedAt: { $gte: startOfDay, $lte: endOfDay },
        });

        return {
          ...branch,
          stats: {
            totalActiveQueues: activeQueuesCount,
            avgWaitTime: avgWaitTime || 0,
            totalCustomersServedToday: totalServedToday || 0,
          },
        };
      })
    );

    return res.status(200).json({
      message: 'Branches with analytics fetched successfully',
      totalBranches: enrichedBranches.length,
      data: enrichedBranches,
    });
  } catch (error) {
    console.error('Error fetching branches with stats:', error);
    return res.status(500).json({
      message: 'Error fetching branches with stats',
      error: error.message,
    });
  }
};