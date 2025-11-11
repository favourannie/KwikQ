// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const developerModel = require('../models/developer')
// const { sendMail } = require('../middleware/brevo');
// const { registerOTP } = require('../utils/developerEmail');

// exports.registerDeveloper = async (req, res) => {
//   try {
//     const { fullName, email, password, confirmPassword } = req.body;

//     if (!fullName || !email || !password || !confirmPassword) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     if (password !== confirmPassword) {
//       return res.status(404).json({ message: 'Passwords do not match' });
//     }

//     const existingDeveloper = await developerModel.findOne({ email: email.toLowerCase() });
//     if (existingDeveloper) {
//       return res.status(400).json({ message: 'Email already registered' });
//     };

//     const salt = await bcrypt.genSalt(10);
//     const hashPassword = await bcrypt.hash(password, salt);
//     const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0");

//     const user = await developerModel.create({
//       fullName,
//       email,
//       password: hashPassword,
//       otp: otp,
//       otpExpiredAt: Date.now() + 1000 * 120
//     });

//     // const token = jwt.sign(
//     //   { id: newDeveloper._id },
//     //   process.env.JWT_SECRET || 'dev_secret_key',
//     //   { expiresIn: '3 days' }
//     // );

//     const detail = {
//       email: user.email,
//       subject: 'Email Verification',
//       html: registerOTP(user.otp, `${user.fullName.split(' ')[0]}`)
//     };

//     await sendMail(detail);
//     await user.save();
//     const response= {
//       fullName: user.fullName,
//       email: user.email
//     };

//     res.status(201).json({
//       message: 'Developer account created successfully',
//         data: response
//     //   token
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error creating developer account',
//       error: error.message
//     });
//   }
// };


// exports.devVerify = async (req, res) => {
//   try {
//     const { otp, email } = req.body;
//     const user = await developerModel.findOne({ email: email.toLowerCase() });

//     if (!user) {
//       return res.status(404).json({
//         message: 'user not found'
//       })
//     };

//     if (Date.now() > user.otpExpiredAt) {
//       return res.status(400).json({
//         message: 'OTP expired'
//       })
//     };

//     if (otp !== user.otp) {
//       return res.status(400).json({
//         message: 'Invalid otp'
//       })
//     };

//     Object.assign(user, { isVerified: true, otp: null, otpExpiredAt: null });
//     await user.save();
//     res.status(200).json({
//       message: 'User verified successfully'
//     })
//   } catch (error) {
//     res.status(500).json({
//       mesaage: 'Error verifying user' + error.message
//     })
//   }
// };


// exports.resendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await developerModel.findOne({ email: email.toLowerCase() });

//     if (!user) {
//       return res.status(404).json({
//         message: 'user not found'
//       })
//     };

//     const otp = Math.round(Math.random() * 1e6).toString().padStart(6, "0");
//     Object.assign(user, { otp: otp, otpExpiredAt: Date.now() + 1000 * 120 });

//     const detail = {
//       email: user.email,
//       subject: 'Resend: Email Verification',
//       html: registerOTP(user.otp, `${user.fullName.split(' ')[0]}`)
//     };

//     await sendMail(detail);
//     await user.save();
//     res.status(200).json({
//       message: 'Otp sent, kindly check your email'
//     })
//   } catch (error) {
//     res.status(500).json({
//       mesaage: 'Error resending otp' + error.message
//     })
//   }
// };

// exports.devLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await developerModel.findOne({ email: email.toLowerCase() });
//     if (user === null) {
//       return res.status(404).json({
//         message: 'User not found'
//       })
//     }
//     const passwordCorrect = await bcrypt.compare(password, user.password);
//     if (passwordCorrect === false) {
//       return res.status(400).json({
//         message: 'Invalid Password'
//       })
//     }

//     if (user.isVerified === false) {
//       return res.status(400).json({
//         message: 'User not verified, Please verify your account to continue'
//       })
//     }

//     const token = await jwt.sign({
//       id: user._id,
//       email: user.email,
//       isAdmin: user.isAdmin
//     }, process.env.JWT_SECRET, { expiresIn: '1day' });

//     // Send a success response
//     res.status(200).json({
//       message: "Login successfull",
//       data: user.fullName,
//       token
//     })

//   } catch (error) {
//     res.status(500).json({
//       message: "Error logging in: " + error.mesaage
//     })
//   }
// }
