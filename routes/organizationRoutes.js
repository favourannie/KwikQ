const { login, createOrganization, makeAdmin, resendOtp, getOrganizations, verifyOtp, getOrganizationsById, updateOrganization, deleteOrganization, changePassword, forgotPassword, resetPassword} = require('../controllers/organizationController');
const { authenticate, adminAuth } = require('../middleware/authenticate');
const { googleAuth, googleCallback } = require('../middleware/passport');
const { registerValidator, verifyValidator, resendValidator } = require('../middleware/validation');

const router = require('express').Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "612e3b6f9f1b8e3a4c4d2f1a"
 *         name:
 *           type: string
 *           example: "VCare Foundation"
 *         email:
 *           type: string
 *           format: email
 *           example: "vcare@gmail.com"
 *         isVerified:
 *           type: boolean
 *           example: false
 *         isAdmin:
 *           type: boolean
 *           example: false
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *           description: JWT token for authenticated requests
 */

/**
 * @swagger
 * /api/v1/create:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Create a new organization
 *     description: Register a new organization, send OTP for email verification, and return organization details (password excluded). The OTP is valid for 120 seconds.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: VCare Foundation
 *                 description: Unique organization name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: vcare@gmail.com
 *                 description: Unique email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: Pass@123
 *                 description: Password will be hashed before storage
 *     responses:
 *       '201':
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: VCare Foundation
 *                     email:
 *                       type: string
 *                       example: vcare@gmail.com
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization already exists
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating organization
 *                 error:
 *                   type: string
 */
router.post("/create", registerValidator, createOrganization);

/**
 * @swagger
 * /api/v1/verify:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Verify organization email using OTP
 *     description: Validate mailbox OTP for organization account verification. The OTP must be valid and not expired.
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
 *                 example: vcare@gmail.com
 *                 description: Email address of the organization to verify
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *                 description: 6-digit OTP received in email
 *     responses:
 *       '200':
 *         description: Organization verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization verified successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - Invalid otp
 *                     - OTP expired
 *       '404':
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error verifying organization
 *                 error:
 *                   type: string
 */
router.post("/verify", verifyValidator, verifyOtp);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Login organization account
 *     description: Authenticate an organization using email and password and return a JWT token valid for 3 days.
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
 *                 example: vcare@gmail.com
 *                 description: Registered email address
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Pass@123
 *                 description: Account password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: string
 *                   description: Organization's full name
 *                 token:
 *                   type: string
 *                   description: JWT token valid for 3 days
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '400':
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid password
 *       '404':
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error signing in
 *                 error:
 *                   type: string
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/resend-otp:
 *   post:
 *     summary: Resend a new OTP to an organization's email.
 *     tags:
 *       - Organizations
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
 *                 example: example@company.com
 *     responses:
 *       200:
 *         description: OTP has been resent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Otp sent, kindly check your email
 *       404:
 *         description: Organization not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 *       500:
 *         description: Error resending OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error resending otp
 */
router.post("/resend-otp", resendValidator, resendOtp);

/**
 * @swagger
 * /api/v1/organizations:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get list of organizations
 *     description: Retrieve a list of all organizations with their branch information. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Organizations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All organizations fetched successfully, total 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Organization'
 *                     properties:
 *                       branches:
 *                         type: array
 *                         description: List of branches associated with the organization
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching organizations
 *                 error:
 *                   type: string
 */
router.get("/organizations", authenticate, getOrganizations);

/**
 * @swagger
 * /api/v1/organizations/{id}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get organization by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/organizations/:id", authenticate, getOrganizationsById);

/**
 * @swagger
 * /api/v1/organizations/{id}:
 *   patch:
 *     tags:
 *       - Organizations
 *     summary: Update organization
 *     description: Update organization name. The new name must be unique.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Organization Name
 *                 description: New unique name for the organization
 *     responses:
 *       '200':
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization with this name already exists
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Organization not found
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating organization
 *                 error:
 *                   type: string
 */
router.patch('/organizations/:id', authenticate, updateOrganization);

/**
 * @swagger
 * /api/v1/organizations/{id}:
 *   delete:
 *     tags:
 *       - Organizations
 *     summary: Delete organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/organizations/:id", authenticate, adminAuth, deleteOrganization);


/**
 * @swagger
 * /api/v1/change-password:
 *   put:
 *     tags:
 *       - Organizations
 *     summary: Change organization password
 *     description: Update organization's password after verifying the current password. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password for verification
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password to set
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current password is incorrect
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Organization not found
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 */
router.put("/change-password/:id", authenticate, changePassword);

/**
 * @swagger
 * /api/v1/forgot-password:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Initiate password reset
 *     description: Sends a password reset OTP to the organization's email. The OTP is valid for 30 minutes.
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
 *                 example: vcare@gmail.com
 *                 description: Registered email address
 *     responses:
 *       '200':
 *         description: Reset OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent to email
 *       '404':
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 *       '500':
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Google OAuth redirect
 */
router.get("/auth/google", googleAuth);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Google OAuth callback
 */
router.get("/auth/google/callback", googleCallback);

module.exports = router;

module.exports = router;
