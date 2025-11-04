const SuperAdminDashboard = require('../models/superAdmin');
const Branch = require('../models/branchModel');
const Organization = require('../models/organizationModel');
const CustomerInterface = require('../models/customerQueueModel'); 


exports.getBranchManagement = async (req, res) => {
  try {
    const { organizationId, status } = req.query;

    // Build query filters dynamically
    const filter = {};
    if (organizationId) filter.organization = organizationId;
    if (status) filter.status = status;

    // Fetch branches and related organizations
    const branches = await Branch.find(filter)
      .populate('organization', 'organizationName email contactPerson')
      .lean();

    // Map and format data
    const branchManagement = branches.map(branch => ({
      branchId: branch._id,
      branchName: branch.branchName || branch.name,
      branchCode: branch.branchCode,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      organization: branch.organization?._id,
      organizationName: branch.organization?.organizationName,
      managerName: branch.managerName,
      email: branch.email,
      phoneNumber: branch.phoneNumber,
      lastLogin: branch.lastLogin,
      status: branch.status,
      operation: branch.operation,
      permission: branch.permission,
      notification: branch.notification,
      queuesToday: branch.queuesToday || 0,
      customersServed: branch.customersServed || 0,
      avgWaitTime: branch.avgWaitTime || 0,
    }));

    // Aggregate analytics overview
    const totalBranches = branchManagement.length;
    const totalActive = branchManagement.filter(b => b.status === 'active').length;
    const totalInactive = totalBranches - totalActive;
    const totalQueues = branchManagement.reduce((acc, b) => acc + (b.queuesToday || 0), 0);
    const totalCustomers = branchManagement.reduce((acc, b) => acc + (b.customersServed || 0), 0);
    const totalAvgWaitTime = totalBranches > 0 ? branchManagement.reduce((acc , b) => acc +(b.avgWaitTime || 0), 0) /totalBranches : 0;


    // Update Super Admin Dashboard
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      {
        $set: {
          'overview.totalBranches': totalBranches,
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
      totalAvgWaitTime
      },
      branchManagement,
    });
  } catch (error) {
    res.status(500).json({message: 'Error in getBranchManagement', error: error.message });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const { organization } = req.body;

    if (!organization) {
      return res.status(400).json({  message: 'Organization ID is required' });
    }

    // Validate organization existence
    const orgExists = await Organization.findById(organization);
    if (!orgExists) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const newBranch = new Branch(req.body);
    await newBranch.save();

    // Update dashboard counts
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      { $inc: { 'overview.totalBranches': 1 } },
      { upsert: true }
    );
  
    res.status(201).json({
      message: 'Branch created successfully',
      newBranch,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating branch', error: error.message });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const updatedBranch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBranch) {
      return res.status(404).json({  message: 'Branch not found' });
    }
    res.status(200).json({ message: 'Branch updated successfully', updatedBranch });
  } catch (error) {
    res.status(500).json({ message: 'Error updating branch', error: error.message });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const deletedBranch = await Branch.findByIdAndDelete(req.params.id);
    if (!deletedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await SuperAdminDashboard.findOneAndUpdate(
      {},
      { $inc: { 'overview.totalBranches': -1 } }
    );

    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting branch', error: error.message });
  }
};


exports.viewBranchReports = async (req, res) => {
  try {
    const { branchId } = req.params;

    const branch = await Branch.findById(branchId)
      .populate('organization', 'organizationName')
      .lean();

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Example: Fetch related queue or customer analytics (optional)
    const totalCustomers = await CustomerInterface.countDocuments({ branch: branchId });
    const servedCustomers = await CustomerInterface.countDocuments({
      branch: branchId,
      status: 'served',
    });

    const report = {
      branchName: branch.branchName,
      organizationName: branch.organization?.organizationName,
      totalCustomers,
      servedCustomers,
      pendingCustomers: totalCustomers - servedCustomers,
      avgWaitTime: branch.avgWaitTime || 0,
      queuesToday: branch.queuesToday || 0,
      lastLogin: branch.lastLogin,
    };

    res.status(200).json({ message: 'Branch report fetched successfully', report });
  } catch (error) {
    console.error('Error in viewBranchReports:', error);
    res.status(500).json({ message: 'Error fetching branch report', error: error.message });
  }
};
