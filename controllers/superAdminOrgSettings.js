const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');

exports.getOrganizationSettings = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('branches', 'branchName city state manager')
      .lean();

    const organizationSettings = organizations.map(org => ({
      organizationId: org._id,
      organizationName: org.organizationName || org.name,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      website: org.website,
      taxId: org.taxId,
      headOfficeAddress: org.headOfficeAddress,
      industryType: org.industryType,
      userAndRoles: org.userAndRoles,
      securitySettings: org.securitySettings,
      subscriptionDetails: org.subscriptionDetails,
      maxBranches: org.maxBranches,
      autoApproval: org.autoApproval,
      totalBranches: org.branches ? org.branches.length : 0,
      branches: org.branches || [],
      createdAt: org.createdAt,
    }));

    // Update Super Admin Dashboard
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      { organizationSettings },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Organization settings fetched successfully',
      organizationSettings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization settings', error: error.message });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const organization = new Organization(req.body);
    await organization.save();

    // Sync to SuperAdminDashboard
    await SuperAdminDashboard.updateOne(
      {},
      { $push: { 'organizationSettings': organization } },
      { upsert: true }
    );

    res.status(201).json({
      message: 'Organization created successfully',
      organization,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating organization', error: error.message });
  }
};


exports.updateOrganization = async (req, res) => {
  try {
    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedOrganization)
      return res.status(404).json({ message: 'Organization not found' });

    // Re-sync dashboard
    const organizations = await Organization.find();
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      { organizationSettings: organizations },
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

exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization)
      return res.status(404).json({ message: 'Organization not found' });

    // Optionally delete all branches under this organization
    await Branch.deleteMany({ organization: req.params.id });
    await Organization.findByIdAndDelete(req.params.id);

    // Update dashboard
    const organizations = await Organization.find();
    await SuperAdminDashboard.findOneAndUpdate(
      {},
      { organizationSettings: organizations },
      { upsert: true }
    );

    res.status(200).json({
      message: 'Organization and its branches deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting organization', error: error.message });
  }
};

exports.getBranchesByOrganization = async (req, res) => {
  try {
    const branches = await Branch.find({ organization: req.params.id })
      .populate('organization', 'organizationName')
      .lean();

    if (!branches || branches.length === 0)
      return res.status(404).json({ success: false, message: 'No branches found for this organization' });

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
      .populate('organization', 'organizationName')
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
    const branch = await Branch.findById(req.params.id)
      .populate('organization', 'organizationName contactEmail contactPhone')
      .lean();

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.status(200).json({
      message: 'Branch fetched successfully',
      branch,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branch', error: error.message });
  }
};

