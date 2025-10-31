const organizationFormModel = require("../models/organizationFormModel");
const organizationModel = require("../models/organizationModel");

exports.createOrganizationForm = async(req,res)=>{
    try {
        const { emailAddress, industryServiceType, headOfficeAddress, city, state, fullName, phoneNumber } = req.body;
        if (!emailAddress || !industryServiceType || !headOfficeAddress || !city || !state || !fullName || !phoneNumber  ){
            return res.status(400).json({
                message: "All fields are required"
            })
        }
  const existEmail = await organizationFormModel.findOne({email: emailAddress})
  if(existEmail){
    return res.status(400).json({
        message: "Email already exists",
    })
  }

  const organizationForm = await organizationFormModel.create({
    industryServiceType,
    headOfficeAddress,
    state,
    city,
    fullName,
    emailAddress,
    phoneNumber : `+234${phoneNumber.slice(-10)}`,
    // organizations: req.organization._id,
  })

  res.status(200).json({
    message: "Organization data saved successfully",
    data: organizationForm
  })
    } catch (error) {
      res.status(500).json({
      message: "Error creating organization",
      error: error.message,
    });
  }
    }