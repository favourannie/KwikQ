const Organization = require('../models/organizationModel');
const Payment = require('../models/paymentModel');

exports.getDashboardOverview = async (req, res) => {
  try {
    
    const orgId = req.user?.id;
    if (!orgId) {
      return res.status(401).json({ message: 'Organization ID required' });
    }
    const activeOrganizations = await Organization.countDocuments({ status: 'active' });

    const activeSubscriptions = await Organization.countDocuments({ isActive: true });

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentCustomers = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('businessName branches planType status');

    
    const pendingPayments = await Payment.find({
      status: { $in: ['Pending', 'Overdue'] }
    })
      .populate('organizations', 'BusinessName planType')
      .sort({ dueDate: 1 }); // soonest first

    res.json({
      stats: {
        activeOrganizations,
        activeSubscriptions,
        monthlyRevenue: totalRevenue[0]?.total || 0,
      },
      recentCustomers,
      pendingPayments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentCustomers = async (req, res) => {
  try {
    const customers = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('businessName branches planType status');
    res.status(201).json({
        message: "Successfully Fetched The Recent Customers ",
        customers});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      status: { $in: ['Pending', 'Overdue'] },
    })
      .populate('organizations', 'BusinessName planType')
      .sort({ dueDate: 1 });
    res.status(201).json({
        message:"Successfully Fetched Pending Payments",
        payments});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};