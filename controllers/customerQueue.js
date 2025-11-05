const CustomerInterface = require('../models/customerQueueModel');
const Branch = require('../models/branchModel');
const Organization = require('../models/organizationModel');

const generateQueueNumber = async (branchId) => {

  const branch = await Branch.findById(branchId);
  if (!branch) throw new Error('Invalid branch ID');

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const lastCustomer = await CustomerInterface.findOne({
    branch: branchId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  })
    .sort({ createdAt: -1 })
    .select('queueNumber');

  
  let newNumber = '001';
  if (lastCustomer && lastCustomer.queueNumber) {
    const lastNum = parseInt(lastCustomer.queueNumber.replace(/\D/g, '')) || 0;
    newNumber = String(lastNum + 1).padStart(3, '0');
  }

  
  const queueNumber = `${branch.branchCode || 'KQ'}-${newNumber}`;
  return queueNumber;
};

exports.createCustomer = async (req, res) => {
  try {
    const { organization, branch, formDetails } = req.body;

    if (!organization || !branch || !formDetails?.fullName || !formDetails?.serviceNeeded) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const orgExists = await Organization.findById(organization);
    if (!orgExists) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(404).json({ message: 'Branch not found' });
    }


    const queueNumber = await generateQueueNumber(branch);

    const newCustomer = new CustomerInterface({
      organization,
      branch,
      formDetails,
      queueNumber,
    });

    const savedCustomer = await newCustomer.save();

    res.status(201).json({
      message: 'Customer added to queue successfully.',
      queueNumber: savedCustomer.queueNumber,
      data: savedCustomer,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ message: 'Error creating customer', error: error.message });
  }
};


exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerInterface.find()
      .populate('organization', 'organizationName')
      .populate('branch', 'branchName city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Customers fetched successfully',
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching customers',
      error: error.message,
    });
  }
};


exports.getCustomerById = async (req, res) => {
  try {
    const customer = await CustomerInterface.findById(req.params.id)
      .populate('organization', 'organizationName')
      .populate('branch', 'branchName city');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Customer fetched successfully',
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching customer',
      error: error.message,
    });
  }
};


exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await CustomerInterface.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error updating customer',
      error: error.message,
    });
  }
};


exports.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await CustomerInterface.findByIdAndDelete(req.params.id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting customer',
      error: error.message,
    });
  }
};


exports.getElderlyCustomers = async (req, res) => {
  try {
    const elderlyCustomers = await CustomerInterface.find({ 'formDetails.elderlyStatus': true });
    res.status(200).json({
      message: 'Elderly customers fetched successfully',
      count: elderlyCustomers.length,
      data: elderlyCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching elderly customers',
      error: error.message,
    });
  }
};

exports.getPregnantCustomers = async (req, res) => {
  try {
    const pregnantCustomers = await CustomerInterface.find({ 'formDetails.pregnantStatus': true });
    res.status(200).json({
      message: 'Pregnant customers fetched successfully',
      count: pregnantCustomers.length,
      data: pregnantCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching pregnant customers',
      error: error.message,
    });
  }
};

exports.getByEmergencyLevel = async (req, res) => {
  try {
    const emergencyCustomers = await CustomerInterface.find({ 'formDetails.emergencyStatus': true });
    res.status(200).json({
      message: 'Emergency customers fetched successfully',
      count: emergencyCustomers.length,
      data: emergencyCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching emergency customers',
      error: error.message,
    });
  }
};