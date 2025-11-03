const CustomerInterface = require('../models/customerQueueModel');


const generateQueueNumber = async (branchId) => {
  
  const lastCustomer = await CustomerInterface.findOne({ branch: branchId })
    .sort({ createdAt: -1 })
    .select('queueNumber');

  let newNumber = '001';

  if (lastCustomer && lastCustomer.queueNumber) {
    const lastNum = parseInt(lastCustomer.queueNumber.replace(/\D/g, '')) || 0; 
    const nextNum = lastNum + 1;
    newNumber = String(nextNum).padStart(3, '0');
  }
  const prefix = 'KQ-'; 
  return `${prefix}${newNumber}`;
};

exports.createCustomer = async (req, res) => {
  try {
    const { organization, branch, formDetails } = req.body;
    console.log(formDetails);
    

    
    if (!organization || !branch || !formDetails?.fullName || !formDetails?.serviceNeeded) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Auto-generate queue number
    const queueNumber = await generateQueueNumber(branch);

    const newCustomer = new CustomerInterface({
      ...req.body,
      queueNumber,
    });

    const savedCustomer = await newCustomer.save();

    res.status(201).json({
      message: `Customer added to queue successfully.`,
      queueNumber: savedCustomer.queueNumber,
      data: savedCustomer,
    });
  } catch (error) {
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
        count: customers.length, data: customers 
    });
  } catch (error) {
    res.status(500).json({ 
        message: 'Error fetching customers', 
        error: error.message 
    });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await CustomerInterface.findById(req.params.id)
      .populate('organization', 'organizationName')
      .populate('branch', 'branchName city');

    if (!customer) {
      return res.status(404).json({ 
        message: 'Customer not found' 
    });
    }

    res.status(200).json({ 
        message: 'Customer fetched successfully', 
        data: customer 
    });
  } catch (error) {
    res.status(500).json({ 
        message: 'Error fetching customer', 
        error: error.message 
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
    res.status(400).json({ message: 'Error updating customer', error: error.message });
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
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};

exports.getElderlyCustomers = async (req, res) => {
  try {
    const elderlyCustomers = await CustomerInterface.find({ 'formDetails.elderlyStatus': true });
    res.status(200).json({ 
        message: 'Elderly customers fetched successfully',
        count: elderlyCustomers.length, data: elderlyCustomers 
    });
  } catch (error) {
    res.status(500).json({ 
        message: 'Error fetching elderly customers', 
        error: error.message 
    });
  }
};

exports.getPregnantCustomers = async (req, res) => {
  try {
    const pregnantCustomers = await CustomerInterface.find({ 'formDetails.pregnantStatus': true });
    res.status(200).json({ count: pregnantCustomers.length, data: pregnantCustomers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pregnant customers', error: error.message });
  }
};

exports.getByEmergencyLevel = async (req, res) => {
  try {
    const emergencyCustomers = await CustomerInterface.find({ 'formDetails.emergencyStatus': true });
    res.status(200).json({ count: emergencyCustomers.length, data: emergencyCustomers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergency customers', error: error.message });
  }
};
