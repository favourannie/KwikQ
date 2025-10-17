const branchModel = require('../models/branchModel');
// const organizationModel = require('../models/organizationModel'); 

exports.createBranch = async (req, res) => {
  try {
    const { organization, name, location, managerName, contactNumber, email } = req.body;

    if (!organization || !name) {
      return res.status(400).json({ message: "Organization ID and branch name are required" });
    }

    const orgExists = await organizationModel.findById(organization);
    if (!orgExists) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const newBranch = new branchModel({
      organization,
      name,
      location,
      managerName,
      contactNumber,
      email,
    });

    await newBranch.save();

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: newBranch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating branch",
      error: error.message,
    });
  }
};


exports.getAllBranches = async (req, res) => {
  try {
    const { organization } = req.query;
    const filter = organization ? { organization } : {};

    const branches = await branchModel.find(filter)
      .populate('organization', 'name email') 
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching branches",
      error: error.message,
    });
  }
};


exports.getBranchById = async (req, res) => {
  try {
    const branch = await branchModel.findById(req.params.id)
      .populate('organization', 'name email');

    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching branch",
      error: error.message,
    });
  }
};


exports.updateBranch = async (req, res) => {
  try {
    const updates = req.body;
    const branch = await branchModel.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating branch",
      error: error.message,
    });
  }
};


exports.deleteBranch = async (req, res) => {
  try {
    const branch = await branchModel.findByIdAndDelete(req.params.id);

    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting branch",
      error: error.message,
    });
  }
};
