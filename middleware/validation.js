const joi = require('joi');


exports.registerValidator = (req, res, next) => {
  const schema = joi.object({
    businessName: joi.string().min(3).trim().pattern(/^[A-Za-z\s]+$/).required().messages({
      'string.empty': 'Business name is required',
      'string.min': 'Business name must be at least 3 characters long',
      'string.pattern.base': 'Business name must contain only letters and spaces'
    }),
    email: joi.string().email().pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/).trim().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Only Gmail addresses are allowed (e.g., example@gmail.com)',
    }),
    password: joi.string().trim().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%_*#?&\s])[A-Za-z\d@$!%_*#?&\s]{8,}$/).required().messages({
      'string.empty': 'Password is required',
      'string.pattern.base': 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, a number, and a special character (@$!%_*#?&)'
    }),
    profile: joi.optional()
  });
  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message
    });
  }

  next();
};


 exports.organizationFormValidator = (req,res,next) => {
      const schema = joi.object({
    industryServiceType: joi.string().min(3).pattern(/^[A-Za-z\s]+$/).trim().required().messages({
      'string.empty': 'Industry service type is required',
      'string.min': 'Industry service type must be at least 3 characters long',
      'string.pattern.base': 'Industry service type must contain only letters and spaces'
    }),
    emailAddress: joi.string().email().trim().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    headOfficeAddress: joi.string().min(3).trim().required().messages({
      'string.empty': 'Head office address is required',
      'string.min': 'Head office address must be at least 3 characters long',
    }),
    city: joi.string().min(3).trim().pattern(/^[A-Za-z\s]+$/).required().messages({
      'string.empty': 'City is required',
      'string.min': 'City must be at least 3 characters long',
      'string.pattern.base': 'City must contain only letters and spaces'
    }),
    state: joi.string().min(3).trim().pattern(/^[A-Za-z\s]+$/).required().messages({
      'string.empty': 'State is required',
      'string.min': 'State must be at least 3 characters long',
      'string.pattern.base': 'State must contain only letters and spaces'
    }),
    fullName: joi.string()
  .min(3)
  .trim()
  .pattern(/^[A-Za-z\s]+$/)
  .required()
  .messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 3 characters long',
    'string.pattern.base': 'Full name must contain only letters and spaces'
  }),
   phoneNumber: joi.string()
  .min(11)
  .trim()
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number must be at least 11 digits long',
    'string.pattern.base': 'Phone number must contain only numbers'
  }),

  })
    const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message
    });
  }
  next();
  }

exports.verifyValidator = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().trim().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    otp: joi.string().trim().required().messages({
      'string.empty': 'OTP is required',
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message
    });
  }

  next();
};


exports.resendValidator = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().email().trim().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation error: ' + error.message
    });
  }

  next();
};