const express = require('express');
const router = express.Router();
const { registerDeveloper, devVerify, devLogin, resendOtp   } = require('../controllers/developer');
const { registerValidator, verifyValidator, resendValidator } = require('../middleware/validation');

/**
 * @swagger
 * /api/v1/developers/register:
 *   post:
 *     summary: Register a new developer account
 *     description: Creates a new developer by validating user input, hashing the password, generating an OTP, and sending a verification email.
 *     tags:
 *       - Developers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Developer's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: Developer's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPassword123!"
 *                 description: Password for the new account
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "StrongPassword123!"
 *                 description: Confirmation of the password
 *     responses:
 *       201:
 *         description: Developer account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Developer account created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *       400:
 *         description: Missing or invalid input, or email already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All fields are required
 *       404:
 *         description: Passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Passwords do not match
 *       500:
 *         description: Server error while creating the developer account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating developer account
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
router.post('/developers/register', registerValidator,registerDeveloper);

/**
 * @swagger
 * /api/v1/devverify:
 *   post:
 *     summary: Verify a developer's account using OTP
 *     description: Validates the OTP sent to the developer's email and marks the account as verified if successful.
 *     tags:
 *       - Developers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: The developer's registered email address
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: The 6-digit OTP sent to the developer's email
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid otp
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user not found
 *       500:
 *         description: Server error while verifying user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error verifying user
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
router.post('/devverify',verifyValidator, devVerify );

/**
 * @swagger
 * /api/v1/resendotp:
 *   post:
 *     summary: Resend OTP to a developer's email
 *     description: Generates and sends a new OTP to the developer's registered email address for verification.
 *     tags:
 *       - Developers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: The developer's registered email address
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Otp sent, kindly check your email
 *       404:
 *         description: Developer account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user not found
 *       500:
 *         description: Server error while resending OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error resending otp
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
router.post('/resendotp', resendValidator,resendOtp);

/**
 * @swagger
 * /api/v1/devlogin:
 *   post:
 *     summary: Developer login
 *     description: Authenticates a verified developer using email and password, returning a JWT token on success.
 *     tags:
 *       - Developers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: The developer's registered email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPassword123!"
 *                 description: The developer's account password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successfull
 *                 data:
 *                   type: string
 *                   example: John Doe
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid password or user not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid Password
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error while logging in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error logging in
 */
router.post('/devlogin', devLogin );


module.exports = router;
