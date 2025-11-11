const branchModel = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerOTP } = require("../utils/email");
const { sendMail } = require("../middleware/brevo");
const dashboardModel = require("../models/dashboardModel");
const queuePointModel = require("../models/queueModel")
const adminSettingsModel = require("../models/adminSettingsModel")

exports.createOrganization = async (req, res) => {
  try {
    const { businessName, email, password, role } = req.body;
    const name = businessName
  .split(' ')
  .filter(word => word.length > 0) // remove extra spaces
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(' ');

    const existingEmail = await organizationModel.findOne({ email: email });
    const existingName = await organizationModel.findOne({ businessName: name });
    if (existingEmail || existingName) {
      return res.status(400).json({
        message: "Organization already exists",
      });
    }

    // if (email.slice(-10) !== '@gmail.com') {
    //   return res.status(400).json({
    //     message: "Please input a valid email address"
    //   })
    // }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const otp = Math.round(Math.random() * 1e6)
      .toString()
      .padStart(6, "0");

    const org = new organizationModel({
      businessName: name,
      email,
      password: hashPassword,
      otp: otp,
      otpExpiredAt: Date.now() + 1000 * 540,
      role: role
    });

    const detail = {
      email: org.email,
      subject: "Email Verification",
      html: registerOTP(org.otp, org.businessName),
    };

    await sendMail(detail);
    await org.save()
    const dashboard = await dashboardModel.create({
      individualId: org._id
    })
    const queuePoint = await queuePointModel.create({
      individualId: org._id
    })
    const adminSettings = await adminSettingsModel.create({
      individualId: org._id
    })
    const response = {
      businessName: org.businessName,
      email: org.email,
    };
    res.status(201).json({
      message: "Organization created successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating organization",
      error: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const org = await organizationModel.findOne({ email: email.toLowerCase() });

    if (!org) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    if (Date.now() > org.otpExpiredAt) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (otp !== org.otp) {
      return res.status(400).json({
        message: "Invalid otp",
      });
    }

    Object.assign(org, { isVerified: true, otp: null, otpExpiredAt: null });
    await org.save();
    res.status(200).json({
      message: "Organization verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying organization: ",
      error: error.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const org = await organizationModel.findOne({ email: email.toLowerCase() });

    if (!org) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    const otp = Math.round(Math.random() * 1e6)
      .toString()
      .padStart(6, "0");
    Object.assign(org, { otp: otp, otpExpiredAt: Date.now() + 1000 * 540 });

      const detail = {
      email: org.email,
      subject: "Resend: Email Verification",
      html: registerOTP(org.otp, `${org.businessName.split(" ")[0]}`),
    };    await sendMail(detail);
    await org.save();
    res.status(200).json({
      message: "Otp sent, kindly check your email",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resending otp",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const org = await organizationModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!org) {
      return res.status(404).json({
        message: "Invalid credentials",
      });
    }
    const inputPassword = await bcrypt.compare(password, org.password);

    if (inputPassword === false) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }
    if (org.isVerified === false) {
      return res.status(403).json({
        message:
          "Account not verified. Please verify your email before logging in.",
      });
    }

    const payload = {
      id: org._id,
      email: org.email,
      isAdmin: org.isAdmin,
      organizationId: org._id
    };
console.log("Org", org)
    const token = jwt.sign(
      {
        id: org._id,
        email: org.email,
        role: org.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3 days" }
    );
    res.status(200).json({
      message: "Login successfull",
      data: {
        name: org.businessName,
        email: org.email,
         org: org._id
        },
      token,
      
    });
  } catch (error) {
    res.status(500).json({
      message: "Error signing in",
      error: error.message,
    });
  }
};


exports.getOrganizations = async (req, res) => {
  try {
    const orgs = await organizationModel.find().populate("branches");
    res.status(200).json({
      message: `All organizations fetched successfully, total: ${orgs.length}`,
      data: orgs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organizations",
      error: error.message,
    });
  }
};

exports.getOrganizationsById = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await organizationModel.findById(id).populate("branches");
    if (org === null) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }
    res.status(200).json({
      message: "Organization fetched successfully",
      data: org,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organization",
      error: error.message,
    });
  }
};

exports.forgotPassword = async(req,res)=>{
    try {
        const {email} = req.body
        const org = await organizationModel.findOne({email: email.toLowerCase().trim()})
        if(!org){
            return res.status(400).json({
                message: "Invalid email provided"
            })
        }

        const otp = Math.round(Math.random() * 1e6)
          .toString()
          .padStart(6, "0");
        Object.assign(org, { otp: otp, otpExpiredAt: Date.now() + 1000 * 120 });

        const detail = {
          email: org.email,
          subject: "Resend: Email Verification",
          html: registerOTP(org.otp, `${org.businessName.split(" ")[0]}`),
        };
        await sendMail(detail);
        await org.save();
        res.status(200).json({
          message: "Otp sent, kindly check your email",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error resending otp",
            error: error.message,
        });
    }
};

exports.resetPasswordRequest = async(req,res)=>{
  try {
    const {email, otp} = req.body
    const org = await organizationModel.findOne({email : email.toLowerCase().trim()})
    if(!org){
      return res.status(400).json({
        message: "Invalid email provided"
      })
    }
    if (Date.now() > org.otpExpiredAt){
      return res.status(400).json({
        message : "Otp expired"
      })
    }
    if(otp !== org.otp){
      return res.status(400).json({
        message: "Invalid otp"
      })
    }
    Object.assign(org, { otp: null, otpExpiredAt: null });
    await org.save();
    res.status(200).json({
      message: "Otp verified successfully"
    })
  } catch (error) {
     res.status(500).json({
            message: "Error resetting password",
            error: error.message,
        });
    }
  }

  exports.resetPassword = async(req,res)=>{
    try {
      const {password, email, confirmPassword} = req.body
      const org = await organizationModel.findOne({email : email.toLowerCase().trim()})
      if(!org){
        return res.status(400).json({
          message: "Invalid email provided"
        })
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          message: "Passwords do not match"
        })
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      Object.assign(org, { password: hashedPassword });
      await org.save();
      res.status(200).json({
        message: "Password reset successfully"
      });
    } catch (error) {
       res.status(500).json({
            message: "Error resetting password",
            error: error.message,
        });
    }
    }

exports.getOrganizations = async (req, res) => {
    try {
        const orgs = await organizationModel.find().populate("branches");
        res.status(200).json({
            message: `All organizations fetched successfully, total: ${orgs.length}`,
            data: orgs,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching organizations",
            error: error.message,
        });
    }
};

exports.getOrganizationsById = async (req, res) => {
    try {
        const { id } = req.params;
        const org = await organizationModel.findById(id).populate("branches").select("businessName email");
        if (org === null) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }
        const orgB = await Branch.find({organizationId: id})
        res.status(200).json({
            message: "Organization fetched successfully",
            data: org,
            totalBranches: orgB.length,
            oragnizationBranches: orgB
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching organization",
            error: error.message,
        });
    }
  }

  
exports.getOnlyOrganizationsById = async (req, res) => {
    try {
        const { id } = req.params;
        const org = await organizationModel.findById(id).select("businessName email city fullName headOfficeAddress industryServiceType phoneNumber state")
        if (org === null) {
            return res.status(404).json({
                message: "Organization not found",
            });
        }
        res.status(200).json({
            message: "Organization fetched successfully",
            data: org,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching organization",
            error: error.message,
        });
    }
  }

exports.changePassword = async (req, res) => {
  try {
    const { confirmPassword, password } = req.body;
    const { id } = req.params;
    const org = await organizationModel.findById(id);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }
    const isMatch = await bcrypt.compare(password, org.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    org.password = await bcrypt.hash(confirmPassword, salt);
    await org.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateOrganizationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { industryServiceType, email, headOfficeAddress, city, state, fullName, phoneNumber } = req.body;
    const existingOrg = await organizationModel.findById(id);
    if (!existingOrg) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }
    const org = await organizationModel.findByIdAndUpdate(id, {
      industryServiceType,
      headOfficeAddress,
      city,
      state,
      fullName,
      phoneNumber,
      emailAddress: email
    }, {
      new: true,
    }).select("industryServiceType headOfficeAddress city state fullName phoneNumber emailAddress")
    res.status(200).json({
      message: "Organization updated successfully",
      data: org,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating organization",
      error: error.message,
    });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    let org = await organizationModel.findByIdAndDelete(id) || await branchModel.findByIdAndDelete(id);
    if (!org) {
      return res.status(404).json({ message: "Organization or branch not found" });
    }
    res.status(200).json({
      message: "Organization deleted successfully",
      data: org,
    });

  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({
      message: "Error deleting organization",
      error: error.message,
    });
  }
};
