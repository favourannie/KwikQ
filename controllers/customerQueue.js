const CustomerInterface = require("../models/customerQueueModel");
const organizationModel = require("../models/organizationModel");
const branchModel = require("../models/branchModel");
const paymentModel = require("../models/paymentModel");
const queuePointModel = require("../models/queueModel");
const Branch = require("../models/branchModel");
const Organization = require("../models/organizationModel");



const generateQueueNumber = () => {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const date = Date.now().toString().slice(-3);
  return `kQ-${date}${random}`;
};

exports.createCustomerQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const { formDetails } = req.body;

    const {
      fullName,
      email,
      phone,
      serviceNeeded,
      additionalInfo,
      priorityStatus,
    } = formDetails;

    // Allowed services
    const allowedServices = [
      "accountOpening",
      "loanCollection",
      "cardCollection",
      "fundTransfer",
      "accountUpdate",
      "generalInquiry",
      "complaintResolution",
    ];

    const finalService = allowedServices.includes(serviceNeeded)
      ? serviceNeeded
      : "other";

    // Detect business: branch or individual
    let business = await branchModel.findById(id);
    let role, assignField;

    if (business) {
      role = "branch";
      assignField = { branchId: id };
    } else {
      business = await organizationModel.findById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      role = "individual";
      assignField = { individualId: id };
    }

    // Get queue points for the business
    const queueQuery = role === "branch"
      ? { branchId: id }
      : { individualId: id };

    let queuePoints = await queuePointModel.find(queueQuery).sort({ createdAt: 1 });

    // Create minimum of 2 queue points
    if (queuePoints.length < 3) {
      const missing = 3 - queuePoints.length;
      for (let i = 1; i <= missing; i++) {
        const newQueue = await queuePointModel.create({
          name: `Queue ${queuePoints.length + i}`,
          ...assignField,
        });
        queuePoints.push(newQueue);
      }
    }

    // Count customers for the business (used for serial/queue rotation)
    const totalCustomers = await CustomerInterface.countDocuments(queueQuery);
    const serialNumber = String(totalCustomers + 1).padStart(3, "0");

    // Determine which queue point the customer should join
    const nextIndex = totalCustomers % queuePoints.length;
    const targetQueuePoint = queuePoints[nextIndex];

    const queueNumber = generateQueueNumber();

    // Create new customer
    const newCustomer = await CustomerInterface.create({
      ...assignField,
      formDetails: {
        fullName,
        email,
        phone,
        serviceNeeded: finalService,
        additionalInfo,
        priorityStatus,
      },
      queueNumber,
      serialNumber,
      joinedAt: new Date(),
    });

    // Push customer into the selected queue point
    targetQueuePoint.customers.push(newCustomer._id);
    await targetQueuePoint.save();

    return res.status(201).json({
      message: `Customer added to ${targetQueuePoint.name}`,
      data: {
        queueNumber: newCustomer.queueNumber,
        serialNumber: `T-${newCustomer.serialNumber}`,
        queuePoint: targetQueuePoint.name,
        serviceNeeded: finalService,
      },
    });

  } catch (error) {
    console.log("Error assigning customer to queue:", error);
    return res.status(500).json({
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

    if (business.role === "branch") {
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

    if (
      !organization ||
      !branch ||
      !formDetails?.fullName ||
      !formDetails?.serviceNeeded
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const orgExists = await Organization.findById(organization);
    if (!orgExists) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(404).json({ message: "Branch not found" });
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
      message: "Customer added to queue successfully.",
      queueNumber: savedCustomer.queueNumber,
      data: savedCustomer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res
      .status(400)
      .json({ message: "Error creating customer", error: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerInterface.find()
      .populate("organization", "organizationName")
      .populate("branch", "branchName city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customers fetched successfully",
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customers",
      error: error.message,
    });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await CustomerInterface.findById(id)
      .populate("organization", "organizationName")
      .populate("branch", "branchName city");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customer",
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
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating customer",
      error: error.message,
    });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const business =
      (await organizationModel.findById(userId)) ||
      (await branchModel.findById(userId));

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }
    const customer =
      (await CustomerInterface.findOne({
        individualId: business._id,
        _id: id,
      })) ||
      (await CustomerInterface.findOne({
        branchId: business._id,
        _id: id,
      }));
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found in queue",
      });
    }
    customer.status = "canceled";
    await customer.save();
    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting customers",
    });
  }
};

exports.getElderlyCustomers = async (req, res) => {
  try {
    const elderlyCustomers = await CustomerInterface.find({
      "formDetails.elderlyStatus": true,
    });
    res.status(200).json({
      message: "Elderly customers fetched successfully",
      count: elderlyCustomers.length,
      data: elderlyCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching elderly customers",
      error: error.message,
    });
  }
};

exports.getPregnantCustomers = async (req, res) => {
  try {
    const pregnantCustomers = await CustomerInterface.find({
      "formDetails.pregnantStatus": true,
    });
    res.status(200).json({
      message: "Pregnant customers fetched successfully",
      count: pregnantCustomers.length,
      data: pregnantCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching pregnant customers",
      error: error.message,
    });
  }
};

exports.getByEmergencyLevel = async (req, res) => {
  try {
    const emergencyCustomers = await CustomerInterface.find({
      "formDetails.emergencyStatus": true,
    });
    res.status(200).json({
      message: "Emergency customers fetched successfully",
      count: emergencyCustomers.length,
      data: emergencyCustomers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching emergency customers",
      error: error.message,
    });
  }
};
