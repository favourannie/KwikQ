const SuperAdminDashboard = require('../models/superAdmin');
const Branch = require('../models/branchModel');
const Organization = require('../models/organizationModel');
const CustomerInterface = require('../models/customerQueueModel'); 

exports.getBranchManagement = async (req, res) => {
  try {
    const { organizationId, status } = req.query;

    // Build dynamic filter
    const filter = {};
    if (organizationId) filter.organization = organizationId;
    if (status) filter.status = status;

    // Fetch branches and populate organization info
    const branches = await Branch.find(filter)
      .populate('organization', 'organizationName managerName managerEmail branchCode')
      .lean();

    // Map and format data
    const branchManagement = branches.map(branch => ({
      branchId: branch._id,
      branchName: branch.branchName,
      branchCode: branch.branchCode,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      organizationId: branch.organization?._id,
      organizationName: branch.organization?.organizationName,
      managerName: branch.managerName || branch.organization?.managerName,
      phoneNumber: branch.phoneNumber,
      lastLogin: branch.lastLogin,
      status: branch.status,
      notification: branch.notification || false,
      queuesToday: branch.queuesToday || 0,
      customersServed: branch.customersServed || 0,
      avgWaitTime: branch.avgWaitTime || 0,
    }));

    // Aggregate analytics
    const totalBranches = branchManagement.length;
    const totalActive = branchManagement.filter(b => b.status === 'active').length;
    const totalInactive = totalBranches - totalActive;
    const totalQueues = branchManagement.reduce((sum, b) => sum + (b.queuesToday || 0), 0);
    const totalCustomers = branchManagement.reduce((sum, b) => sum + (b.customersServed || 0), 0);
    const totalAvgWaitTime =
      totalBranches > 0
        ? branchManagement.reduce((sum, b) => sum + (b.avgWaitTime || 0), 0) / totalBranches
        : 0;

    // Update Super Admin Dashboard
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      {
        $set: {
          'overview.totalBranches': totalBranches,
          'overview.totalActive': totalActive,
          'overview.totalInactive': totalInactive,
          'overview.totalActiveQueues': totalQueues,
          'overview.totalCustomers': totalCustomers,
          'overview.totalAvgWaitTime': totalAvgWaitTime,
          branchManagement,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Branch management data retrieved successfully',
      overview: {
        totalBranches,
        totalActive,
        totalInactive,
        totalQueues,
        totalCustomers,
        totalAvgWaitTime: Number(totalAvgWaitTime.toFixed(2)),
      },
      branchManagement,
    });
  } catch (error) {
    console.error('Error in getBranchManagement:', error);
    res.status(500).json({
      message: 'Error in getBranchManagement',
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
        .populate('organization', 'organizationName')
        .lean();

      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      branches = [branch];
    } else {
      // Get all branches
      branches = await Branch.find()
        .populate('organization', 'organizationName')
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
