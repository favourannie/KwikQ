const Branch = require('../models/branchModel'); 
const Organization = require('../models/organizationModel');

exports.createBranch = async (req, res) => {
  try {
    const {
      organizationName,
      industryServiceType,
      headOfficeAddress,
      city,
      state,
      fullName,
      emailAddress,
      phoneNumber
    } = req.body;

    if ( !organizationName || !industryServiceType || !headOfficeAddress || !city || !state) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }

  
    const orgExists = await Organization.find(organizationName);
    if (!orgExists) return res.status(404).json({ message: "Organization not found" });

    const newBranch = await Branch.create({
      organizationName,
      industryServiceType,
      headOfficeAddress,
      city,
      state,
      fullName,
      emailAddress,
      phoneNumber
    });

    await newBranch.save();

    res.status(201).json({
      message: "Branch created successfully",
      data: newBranch,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating branch",
      error: error.message,
    });
  }
};

exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find().populate('organization');

    res.status(200).json({
      message: `All branches fetched successfully, total: ${branches.length}`,
      data: branches
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching branches",
      error: error.message
    });
  }
};

exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('organization');
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({
      message: "Branch fetched successfully",
      data: branch
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching branch",
      error: error.message
    });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ 
        message: "Branch not found" });
    }

    res.status(200).json({
      message: "Branch updated successfully",
      data: updatedBranch
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating branch",
      error: error.message
    });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const deletedBranch = await Branch.findByIdAndDelete(req.params.id);
    if (!deletedBranch) {
      return res.status(404).json({ 
        message: "Branch not found" 
      });
    }

    res.status(200).json({
      message: "Branch deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting branch",
      error: error.message
    });
  }
};
