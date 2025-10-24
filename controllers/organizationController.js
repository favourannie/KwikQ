const Branch = require("../models/branchModel");
const organizationModel = require("../models/organizationModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerOTP } = require("../utils/email");
const { sendMail } = require("../middleware/brevo");

exports.createOrganization = async (req, res) => {
  try {
    const { businessName, email, password } = req.body;
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

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const otp = Math.round(Math.random() * 1e6)
      .toString()
      .padStart(6, "0");

    const org = await organizationModel.create({
      businessName: name,
      email,
      password: hashPassword,
      otp: otp,
      otpExpiredAt: Date.now() + 1000 * 120,
    });

    const detail = {
      email: org.email,
      subject: "Email Verification",
      html: registerOTP(org.otp, `${org.businessName}`),
    };

    await sendMail(detail);
    await org.save();
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
    Object.assign(org, { otp: otp, otpExpiredAt: Date.now() + 1000 * 120 });

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
    const token = await jwt.sign(
      {
        id: org._id,
        email: org.email,
        isAdmin: org.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3 days" }
    );
    res.status(200).json({
      message: "Login successfull",
      data: org.name,
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

exports.googleAuthLogin = async (req, res) => {
  try {
    const token = await jwt.sign(
      {
        id: req.org._id,
        email: req.org.email,
        isAdmin: req.org.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1day" }
    );
    res.status(200).json({
      message: "Organization logged in successfully",
      data: req.org.businessName,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in with google: ",
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

        // Generate reset token
        const resetToken = jwt.sign(
            {id: org._id}, 
            process.env.JWT_SECRET, 
            {expiresIn: "24h"}
        );
        
        // Save token to DB
        await organizationModel.findByIdAndUpdate(
            org._id, 
            {token: resetToken},
            {new: true}
        );
        
        // Frontend URL for password reset
        const resetLink = `${'http://localhost:6767'}/reset-password/${resetToken}`;
        
        // Send reset email
        await sendMail({
            email: org.email,
            subject: "Reset Your Password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Your Password</h2>
                    <p>Hello ${org.businessName},</p>
                    <p>We received a request to reset your password. Click the link below to set a new password:</p>
                    <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #f3bf04; color: black; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>The KwikQ Team</p>
                </div>
            `
        });

        // Don't expose token in response
        res.status(200).json({
            message: "Password reset instructions sent to your email"
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            message: "Failed to process password reset request",
            error: error.message
        });  
    }
}

exports.resetPassword = async(req,res)=>{
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if(!token) {
            return res.status(400).json({
                message: "Reset token is required"
            });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                message: "Reset link has expired or is invalid"
            });
        }

        // Find organization and verify token matches
        const org = await organizationModel.findOne({
            _id: decoded.id,
            token: token
        });

        if (!org) {
            return res.status(400).json({
                message: "Invalid or expired reset link"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Update password and clear reset token
        await organizationModel.findByIdAndUpdate(
            org._id,
            {
                password: hash,
                token: null  // Clear the reset token
            },
            { new: true }
        );

        res.status(200).json({
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            message: "Failed to reset password",
            error: error.message
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

exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const existingName = await organizationModel.findOne({ name: name });
    if (existingName) {
      return res.status(400).json({
        message: "Organization with this name already exists",
      });
    }
    const org = await organizationModel.findByIdAndUpdate(id, name, {
      new: true,
    });
    if (org === null) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }
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
    const org = await organizationModel.findByIdAndDelete(id);
    if (org === null) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }
    res.status(200).json({
      message: "Organization deleted successfully",
      data: org,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting organization",
      error: error.message,
    });
  }
};
