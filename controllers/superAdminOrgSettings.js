const SuperAdminDashboard = require('../models/superAdmin');
const Organization = require('../models/organizationModel');
const Branch = require('../models/branchModel');
const SuperAdmin = require('../models/superAdmin');
const jwt = require("jsonwebtoken");
const Billing = require('../models/billing');


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
