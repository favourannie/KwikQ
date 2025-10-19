
const Branch = require('../models/branchModel');
const organizationModel = require('../models/organizationModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerOTP } = require('../utils/email');
const { sendMail } = require('../middleware/brevo')

exports.createOrganization = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingEmail = await organizationModel.findOne({ email: email });
    const existingName = await organizationModel.findOne({ name: name });
    if (existingEmail || existingName) {
      return res.status(400).json({
         message: 'Organization already exists' 
        });
    }

      const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0");
    
    const org = await organizationModel.create({
      name,
      email,
      password: hashPassword,
      otp: otp,
      otpExpiredAt: Date.now() + 1000 * 120
    });
    
    const detail = {
      email: org.email,
      subject: 'Email Verification',
      html: registerOTP(org.otp, `${org.name}`)
    };
    
     await sendMail(detail);
    await org.save();
    const response = {
      name: org.name,
      email: org.email
    };
    res.status(201).json({
      message: 'Organization created successfully',
      data: response
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating organization',
      error: error.message
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const org = await organizationModel.findOne({ email: email.toLowerCase() });

    if (!org) {
      return res.status(404).json({
        message: 'Organization not found'
      })
    };

    if (Date.now() > org.otpExpiredAt) {
      return res.status(400).json({
        message: 'OTP expired'
      })
    };

    if (otp !== org.otp) {
      return res.status(400).json({
        message: 'Invalid otp'
      })
    };
    
    Object.assign(org, { isVerified: true, otp: null, otpExpiredAt: null });
    await org.save();
    res.status(200).json({
      message: 'Organization verified successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: "Error verifying organization: ",
      error: error.message
    })
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const org = await organizationModel.findOne({ email: email.toLowerCase() });

    if (!org) {
      return res.status(404).json({
        message: 'Organization not found'
      })
    };

    const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0");
    Object.assign(org, {otp: otp, otpExpiredAt: Date.now() + 1000 * 120});

      const detail = {
      email: org.email,
      subject: 'Resend: Email Verification',
      html: registerOTP(org.otp, `${org.name.split(' ')[0]}`)
    };

    await sendMail(detail);
    await org.save();
    res.status(200).json({
      message: 'Otp sent, kindly check your email'
    })
  } catch (error) {
    res.status(500).json({
      message: "Error resending otp" ,
      error: error.message
    })
  }
};

exports.login = async(req,res)=>{
  try {
    const {email, password} = req.body
    const org = await organizationModel.findOne({email: email.toLowerCase()})
   if(!org){
      return res.status(404).json({
        message: "Organization not found"
      })
    }
    const inputPassword = await bcrypt.compare(password, org.password)

    if(inputPassword === false){
      return res.status(400).json({
        message: "Invalid password"
      })
    }

    const token = await jwt.sign({
      id: org._id,
      email: org.email,
      isAdmin: org.isAdmin
    }, process.env.JWT_SECRET, {expiresIn: "3 days"})
    res.status(200).json({
      message: "Login successfull",
      data: org.fullName,
      token
    })
  } catch (error) {
    res.status(500).json({
      message: "Error signing in",
      error: error.message
    })
  }
}

exports.makeAdmin = async(req,res)=>{
  try {
    const {id} = req.params
    const org = await organizationModel.findById(id)
    if(org === null){
      return res.status(404).json({
        message: "Organization not found"
      })
    }
    org.isAdmin = true

    await org.save()
    res.status(200).json({
      message: "Organization promoted to an admin successfully"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error making organization an admin",
      error: error.message
    })
  }
}

exports.getOrganizations = async (req, res) => {
  try {
    const orgs = await organizationModel.find().populate('branches');
    res.status(200).json({
      message: `All organizations fetched successfully, total: ${orgs.length}`,
      data: orgs
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching organizations',
      error: error.message
    });
  }
};

exports.googleAuthLogin = async (req,res)=>{
  try {
    const token = await jwt.sign({
      id: req.user._id,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    },
  process.env.JWT_SECRET, {expiresIn: "1day"}
  )
  res.status(200).json({
    message: "User logged in successfully",
    data: req.user.fullName,
    token
  })
  } catch (error) {
    res.status(500).json({
      message: "Error logging in with google: " 
    + error.mesaage
    })
  }
}

exports.getOrganizationsById = async (req, res) => {
  try {
    const {id} = req.params
    const org = await organizationModel.findById(id).populate('branches');
    if(org === null){
      return res.status(404).json({
        message: "Organization not found"
      })
    }
    res.status(200).json({
      message: "Organization fetched successfully",
      data: org
    })
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organization",
      error: error.message
    })
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const {id} = req.params
    const {name } = req.body
    const existingName = await organizationModel.findOne({ name: name });
    if (existingName) {
      return res.status(400).json({
        message: "Organization with this name already exists"
      })
    }
    const org = await organizationModel.findByIdAndUpdate(id, name, {new: true})
    if(org === null){
      return res.status(404).json({
        message: "Organization not found"
      })
    }
    res.status(200).json({
      message: "Organization updated successfully",
      data: org
    })
  } catch (error) {
    res.status(500).json({
      message: "Error updating organization",
      error: error.message
    })
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const {id} = req.params
    const org = await organizationModel.findByIdAndDelete(id)
    if(org === null){
      return res.status(404).json({
        message: "Organization not found"
      })
    }
    res.status(200).json({
      message: "Organization deleted successfully",
      data: org
    })
  } catch (error) {
    res.status(500).json({
      message: "Error deleting organization",
      error: error.message
    })
  }
};
