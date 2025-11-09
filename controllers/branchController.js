const jwt = require("jsonwebtoken");
const Branch = require("../models/branchModel");
const Organization = require("../models/organizationModel");
const { branchMail } = require("../utils/branchTemplete");
const { sendMail } = require("../middleware/brevo");

exports.createBranch = async (req, res) => {
  try {
    console.log('requst user:', req.user)
    const id = req.user.id;
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (organization.role !== "multi") {
      return res.status(403).json({ message: "Only multi organizations can create branches" });
    }

    const {
      city,
      state,
      branchName,
      address,
      serviceType,
      managerName,
      managerEmail,
      managerPhone,
    } = req.body;

    const branchExists = await Branch.findOne({ branchName, address });

    if (branchExists) {
      return res.status(400).json({ message: "Branch already exists" });
    }

    const newBranch = await Branch.create({
      organizationId: organization._id,
      branchName,
      branchCode : Math.random().toString(36).substring(2, 8).toUpperCase(),
      address,
      state,
      city,
      serviceType,
      managerName,
      managerEmail,
      managerPhone,
    });

    organization.branches.push(newBranch._id);
    await organization.save();

   
    
    const email = organization.email || organization.email ||organization.userEmail || organization.contactEmail;
     console.log("admin:", email);
    const branchCode = newBranch.branchCode;
   console.log(branchCode)
    try{ 
    await sendMail({
        email: email,
        // toName: organization.businessName || "Admin",
        subject: `New Branch Created - ${branchName}`,
        html: branchMail(branchName,
          branchCode,
        managerName,
        managerEmail,
        managerPhone,
        address,
        city,
        state,
        
      
      )});
        }catch(mailError){
          console.log("Error sending email:", mailError.message)
        }
    

    return res.status(201).json({
      message: "Branch created successfully",
      data: newBranch,
    });

  } catch (error) {
    console.log("Error creating branch:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "session expired login to continue" });
    }
    return res.status(500).json({
      message: "Error creating branch",
      error: error,
    });
  }
};


exports.branchLogin = async (req, res) => {
  try {
    const { managerEmail, branchCode } = req.body;
    
    if (!managerEmail || !branchCode) {
      return res.status(400).json({
        message: "Manager email and branch code are required",
      });
    }

    const branch = await Branch.findOne({ managerEmail, branchCode });
    const organization = branch.organizationId
    console.log(organization)
    if (!branch) {
      return res.status(404).json({
        message: "Invalid manager email or branch code",
      });
    }
    const token = jwt.sign({
      id: branch._id, 
      email: branch.managerEmail
    }, 
    process.env.JWT_SECRET, {
      expiresIn: "1 day"
    }
  )
    return res.status(200).json({
      message: "Branch login successful",
      token,
      branch: {
        id: branch._id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        managerName: branch.managerName,
        managerEmail: branch.managerEmail
      }, organization,
      token
    });
  } catch (error) {
    console.error("Error logging in branch:", error);
    return res.status(500).json({
      message: "Server error while logging in branch",
      error: error.message,
    });
  }
};



exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate('organizationId', 'organizationName email') 
      .sort({ createdAt: -1 }); 

    if (!branches || branches.length === 0) {
      return res.status(404).json({ message: "No branches found" });
    }

    return res.status(200).json({
      message: "Branches fetched successfully",
      count: branches.length,
      data: branches,
    });

  } catch (error) {
    console.error("Error fetching branches:", error);
    return res.status(500).json({
      message: "Error fetching branches",
      error: error.message,
    });
  }
};

exports.getBranchById = async (req, res) => {
  try {
     const { id } = req.params; // Branch ID from route

    const branch = await Branch.findById(id)
      .populate('organizationId', 'managerName managerEmail branchCode') // optional
      .lean();

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    return res.status(200).json({
      message: "Branch fetched successfully",
      data: branch,
    });

  } catch (error) {
    console.error("Error fetching branch:", error);
    return res.status(500).json({
      message: "Error fetching branch",
      error: error.message,
    });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; 


    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // return updated doc, validate schema
    ).populate('organizationId', 'organizationName email');

    return res.status(200).json({
      message: "Branch updated successfully",
      data: updatedBranch,
    });

  } catch (error) {
    console.error("Error updating branch:", error);
    return res.status(500).json({
      message: "Error updating branch",
      error: error.message,
    });
  }
};

exports.deleteBranch = async (req, res) => {
try {
    const { id } = req.params; 

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (branch.organizationId) {
      await Organization.findByIdAndUpdate(
        branch.organizationId,
        { $pull: { branches: branch._id } }
      );
    }

    await Branch.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Branch deleted successfully",
      deletedBranchId: id,
    });

  } catch (error) {
    console.error("Error deleting branch:", error);
    return res.status(500).json({
      message: "Error deleting branch",
      error: error.message,
    });
  }
};
