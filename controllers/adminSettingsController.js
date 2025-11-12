const adminSettingsModel = require("../models/adminSettingsModel")
const organizationModel = require("../models/organizationModel")
const branchModel = require("../models/branchModel")

exports.getBusinessDetails = async(req, res)=>{
    try {
        const {id} = req.params
        const business = await organizationModel.findById(id) || await branchModel.findById(id)
        if(!business){
            return res.status(404).json({
                message: "Business not found"
            })
        }
        
       let details = {};

    
     if (business.role === "multi") {
      const branches = await branchModel.find({ organizationId: business._id });
      details = {
        businessName: business.businessName,
        phoneNumber: business.phoneNumber,
        businessAddress: business.headOfficeAddress,
        role: business.role,
        branches,
      };
    } else if (business.role === "individual") {
      details = {
        businessName: business.businessName,
        phoneNumber: business.phoneNumber,
        businessAddress: business.headOfficeAddress,
        role: business.role,
      };
    } else if (business.role === "branch") {
      const org = await organizationModel.findById(business.organizationId);
      details = {
        businessName: business.businessName || org?.businessName,
        phoneNumber: business.phoneNumber,
        businessAddress: business.branchAddress,
        role: "branch",
        parentOrganization: org?.businessName || null,
      };
    }

    return res.status(200).json({
      message: "Business details fetched successfully.",
      data: details,
    });
  } catch (error) {
    console.error("Error getting organization details:", error);
    res.status(500).json({
      message: "Error getting organization details.",
      error: error.message,
    });
  }
};

exports.updateBusinessDetails = async (req, res) => {
  try {
    const { businessName, phoneNumber, businessAddress } = req.body;
    const { id } = req.params;

    const business =
      (await organizationModel.findById(id)) ||
      (await branchModel.findById(id));

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    let updated;

    if (business.role === "multi") {
      updated = await adminSettingsModel.findOneAndUpdate(
        { branchId: id },
        {
          businessName,
          phoneNumber,
          businessAddress,
        },
        { new: true, upsert: true } 
      );
    } else if (business.role === "individual") {
      updated = await adminSettingsModel.findOneAndUpdate(
        { individualId: id },
        {
          businessName,
          phoneNumber,
          businessAddress,
        },
        { new: true, upsert: true } 
      );
    }

    res.status(200).json({
      message: "Business updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating business details.",
      error: error.message,
    });
  }
};

exports.setWorkingDays = async(req,res)=>{
  try {
    const id = req.user.id
    const {openingTime, closingTime, workingDays, timezone} = req.body
    const business = await organizaionModel.findById(id) || await branchModel.findById(id)
    if(!business){
      return res.status(404).json({
        message: "Business not found"
      })
    }
    let existing
    if(business.role === "individual"){
      existing = await adminSettingsModel.findOne({
        individualId: business._id
      })
    } else if (business.role === "multi"){
      existing = await adminSettingsModel.findOne({
        branchId: business._id
      })
    }
    if(existing){
       existing.openingTime = openingTime;
      existing.closingTime = closingTime;
      existing.workingDays = workingDays;
      existing.timezone = timezone || existing.timezone;
      existing.updatedAt = new Date();
      await existing.save();

      return res.status(200).json({
        message: "Operating hours updated successfully",
        data: existing,
      });
    }
    const newHours = await adminSettingsModel.create({
      businessId: req.user.id,
      openingTime,
      closingTime,
      workingDays,
      timezone,
    });

    res.status(201).json({
      message: "Operating hours created successfully",
      data: newHours,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating business details.",
      error: error.message,
    });
  }
}

exports.getOperatingHours = async (req, res) => {
  try {
    const id = req.user.id
    const business = await organizationModel.findById(id) || await branchModel.findById(id)
    if(!business){
      return res.status(404).json({
        message: "Business not found"
      })
    }
    let hours;
    if(business.role === "individual"){
      hours = await adminSettingsModel.findOne({individualId: business._id})
    } else if( business.role === "multi"){
      hours = await adminSettingsModel.findOne({branchId: business._id})
    }

    if (!hours) return res.status(404).json({ message: "Operating hours not set yet" });

    res.status(200).json({
      message: "Operating hours retrieved successfully",
      data: hours,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving operating hours",
      error: error.message,
    });
}
};