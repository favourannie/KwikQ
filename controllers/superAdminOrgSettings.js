const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const SuperAdmin = require('../models/superAdmin');
const jwt = require("jsonwebtoken");
const Billing = require('../models/billing');


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
      industryType: org.industryType
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


exports.updateSecuritySettings = async (req, res) => {
  try {
    const { Id } = req.params;
    const { twoFactorAuth, loginNotifications } = req.body;

    const organization = await Organization.findById(Id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    organization.securitySettings = {
      ...organization.securitySettings,
      twoFactorAuth: twoFactorAuth ?? organization.securitySettings?.twoFactorAuth,
      loginNotifications: loginNotifications ?? organization.securitySettings?.loginNotifications,
      updatedAt: new Date(),
    };

    await organization.save();

    res.status(200).json({
      message: 'Security settings updated successfully',
      securitySettings: organization.securitySettings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating security settings', error: error.message });
  }
};

// Get Security Settings for an Organization
exports.getSecuritySettings = async (req, res) => {
  try {
    const { Id } = req.user.id;
    const organization = await Organization.findById(Id).select('securitySettings name');
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json({
      message: `Security settings for ${organization.name}`,
      securitySettings: organization.securitySettings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching security settings', error: error.message });
  }
};


// 💳 Add New Card
exports.addCardMethod = async (req, res) => {
  try {
    const { Id } = req.user.Id;
    const { cardNumber, expiryMonth, expiryYear, cardHolderName, cardType } = req.body;

    const organization = await Organization.findById(Id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const newCard = {
      cardHolderName,
      cardType,
      last4: cardNumber.slice(-4),
      expiryMonth,
      expiryYear,
      addedAt: new Date(),
    };

    organization.billingInfo = organization.billingInfo || {};
    organization.billingInfo.cards = organization.billingInfo.cards || [];
    organization.billingInfo.cards.push(newCard);

    await organization.save();

    res.status(201).json({
      message: 'Card method added successfully',
      cards: organization.billingInfo.cards,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding card method', error: error.message });
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


// exports.superAdminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // You can store Super Admin credentials in a dedicated collection or .env
//     const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@queueless.com';
//     const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';

//     if (email !== superAdminEmail) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Compare password (for real use, hash & store securely)
//     const isMatch = password === superAdminPassword;
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Create token
//     const token = jwt.sign(
//       { email, role: 'super-admin' },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.status(200).json({
//       message: 'Super Admin logged in successfully',
//       token,
//       role: 'super-admin',
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error during Super Admin login', error: error.message });
//   }
// };


// exports.organizationLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const organization = await Organization.findOne({ email });
//     if (!organization)
//       return res.status(404).json({ message: 'Organization not found' });

//     const isPasswordValid = await bcrypt.compare(password, organization.password);
//     if (!isPasswordValid)
//       return res.status(401).json({ message: 'Invalid password' });

//     const token = jwt.sign(
//       { id: organization._id, role: 'organization-admin' },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.status(200).json({
//       message: 'Organization login successful',
//       token,
//       organizationId: organization._id,
//       role: 'organization-admin',
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error during organization login', error: error.message });
//   }
// };


// exports.branchLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const branch = await Branch.findOne({ email }).populate('organization');
//     if (!branch)
//       return res.status(404).json({ message: 'Branch not found' });

//     const isPasswordValid = await bcrypt.compare(password, branch.password);
//     if (!isPasswordValid)
//       return res.status(401).json({ message: 'Invalid password' });

//     const token = jwt.sign(
//       {
//         id: branch._id,
//         organizationId: branch.organization?._id,
//         role: 'branch-admin'
//       },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     // Update last login
//     branch.lastLogin = new Date();
//     await branch.save();

//     res.status(200).json({
//       message: 'Branch login successful',
//       token,
//       branchId: branch._id,
//       organizationId: branch.organization?._id,
//       role: 'branch-admin',
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error during branch login', error: error.message });
//   }
// };