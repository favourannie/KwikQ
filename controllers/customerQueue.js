// const customerQueueModel = require('../models/customerQueueModel');
const CustomerInterface = require('../models/customerQueueModel');
const organizationModel = require('../models/organizationModel');
const branchModel = require("../models/branchModel")

const queuePointModel = require("../models/queueModel");


exports.createCustomerQueue = async (req, res) => {
  try {
    const { formDetails } = req.body;
    const id = req.params.id
    const business = await organizationModel.findById(id) || await branchModel.findById(id)

    if(!business){
      return res.status(404).json({
        message: "Business not found"
      })
    }
    const { fullName, email, phone, serviceNeeded, additionalInfo, priorityStatus } = formDetails;

    const allowedServices = [
      "accountOpening",
      "loanCollection",
      "cardCollection",
      "fundTransfer",
      "accountUpdate",
      "generalInquiry",
      "complaintResolution",
    ];

    const finalService =
      allowedServices.includes(serviceNeeded) ? serviceNeeded : "other";

    let queuePoints;
    if(business.role === "multi"){
     queuePoints = await queuePointModel.find({ branchId: id }).sort({ createdAt: 1 });
    } else if(business.role === "individual"){
      queuePoints = await queuePointModel.find({ individualId: id }).sort({ createdAt: 1 });
    } else {
      return res.status(400).json({
        message: "Invalid business role. Must be 'multi' or 'individual'.",
      });
    }

    if (queuePoints.length < 3) {
      const missing = 3 - queuePoints.length;
      const newPoints = [];

      for (let i = 1; i <= missing; i++) {
        const newQueue = await queuePointModel.create({
          name: `Queue ${queuePoints.length + i}`,
        })
         if (business.role === "multi"){
          newQueue.branchId = id;
         } else {
          newQueue.individualId = id;
         }
         const q = await queuePointModel.create(newQueue)
        newPoints.push(q);
      }

      queuePoints = [...queuePoints, ...newPoints];
    }

    const allCustomers = await CustomerInterface.find({ branchId: id }).countDocuments() || await CustomerInterface.find({individualId: id}).countDocuments()
    const nextIndex = allCustomers % 3; 
    const targetQueuePoint = queuePoints[nextIndex];

    const generateQueueNumber = () => {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString().slice(-3);
  return `Q-${timePart}${randomPart}`;
};

    const nextQueueNumber = generateQueueNumber()

    let newCustomer;
    if(business.role === "multi"){
      newCustomer = await CustomerInterface.create({
      branchId: id,
      formDetails: {
        fullName,
        email,
        phone,
        serviceNeeded: finalService,
        additionalInfo,
        priorityStatus,
      },
      queueNumber: nextQueueNumber,
      joinedAt: new Date().toISOString(),
    });
    } else if(business.role === "individual"){
      newCustomer = await CustomerInterface.create({
      individualId: id,
      formDetails: {
        fullName,
        email,
        phone,
        serviceNeeded: finalService,
        additionalInfo,
        priorityStatus,
      },
      queueNumber: nextQueueNumber,
      joinedAt: new Date().toISOString(),
    });
    }
    

    targetQueuePoint.customers.push(newCustomer.id);
    await targetQueuePoint.save();

    res.status(201).json({
      message: `Customer added to ${targetQueuePoint.name}`,
      data: {
        queueNumber: newCustomer.queueNumber,
        queuePoint: targetQueuePoint.name,
        serviceNeeded: finalService,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error assigning customer to queue",
      error: error.message,
    });
  }
};

exports.getQueuePoints = async (req, res) => {
  try {
    const { id } = req.params;

    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    let queuePoints;

    if (business.role === "multi") {
      queuePoints = await queuePointModel.find({ branchId: id }).lean();
    } else if (business.role === "individual") {
      queuePoints = await queuePointModel.find({ individualId: id }).lean();
    } else {
      return res.status(400).json({
        message: "Invalid business role",
      });
    }

    if (!queuePoints || queuePoints.length === 0) {
      return res.status(200).json({
        message: "No queue points found for this business",
        data: [],
      });
    }

   let totalWaiting = 0;
const queuePointsWithCounts = [];

for (const point of queuePoints) {
  const waitingCount = await CustomerInterface.countDocuments({
    _id: { $in: point.customers },
    status: "waiting",
  });

  totalWaiting += waitingCount;

  queuePointsWithCounts.push({
    _id: point._id,
    name: point.name,
    totalCustomers: point.customers?.length || 0,
    waitingCount,
  });
}
    return res.status(200).json({
      message: "Queue points fetched successfully",
      totalWaiting,
      data: queuePointsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching queue points",
      error: error.message,
    });
  }
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
