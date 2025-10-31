const { login, createOrganization, resendOtp, getOrganizations, verifyOtp, getOrganizationsById, updateOrganization, deleteOrganization, changePassword, forgotPassword, resetPassword, resetPasswordRequest} = require('../controllers/organizationController');
const { authenticate, adminAuth } = require('../middleware/authenticate');
const { registerValidator, verifyValidator, resendValidator } = require('../middleware/validation');

const router = require('express').Router();

/**
 * @swagger
 * /api/v1/create:
 *   post:
 *     summary: Register a new organization
 *     description: Creates a new organization account and sends an OTP email for verification.
 *     tags:
 *       - Organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - email
 *               - password
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: "Kwikq Technologies"
 *                 description: Name of the organization. Automatically formatted to title case.
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "info@kwikq.com"
 *                 description: Organization’s email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPass123!"
 *                 description: Password for the organization account.
 *     responses:
 *       201:
 *         description: Organization created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organization created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     businessName:
 *                       type: string
 *                       example: "Kwikq Technologies"
 *                     email:
 *                       type: string
 *                       example: "info@kwikq.com"
 *       400:
 *         description: Organization already exists (duplicate email or business name)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organization already exists"
 *       500:
 *         description: Internal server error while creating the organization
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating organization"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
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
 *     summary: Send OTP for password reset
 *     description: Sends a one-time password (OTP) to the organization's registered email to initiate the password reset process.
 *     tags:
 *       - Authentication
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
 *                 example: orgadmin@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Otp sent, kindly check your email
 *       400:
 *         description: Invalid email or organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email provided
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
 *                   example: Internal Server Error
 */
router.post("/forgot-password", forgotPassword);


/**
 * @swagger
 * /api/v1/reset-password-otp:
 *   post:
 *     summary: Verify the OTP sent to email before allowing password reset
 *     description: >
 *       This endpoint verifies the OTP code sent to the organization's registered email.
 *       Once verified, the organization can proceed to reset their password using the reset-password endpoint.
 *     tags:
 *       - Authentication
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
 *                 example: kwikq@gmail.com
 *               otp:
 *                 type: string
 *                 example: "729187"
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Otp verified successfully"
 *       400:
 *         description: Invalid or expired OTP or email not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Otp expired"
 *       500:
 *         description: Server error while verifying OTP.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error resetting password"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post("/reset-password-otp", resetPasswordRequest);

/**
 * @swagger
 * /api/v1/reset-password:
 *   post:
 *     summary: Reset an organization's password
 *     description: Allows an organization to reset their password using their registered email.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: "org@example.com"
 *               password:
 *                 type: string
 *                 example: "newSecurePassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "newSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password reset successfully
 *       400:
 *         description: Invalid email or passwords do not match
 *         content:
 *           application/json:
 *             examples:
 *               invalidEmail:
 *                 summary: Invalid email
 *                 value:
 *                   message: Invalid email provided
 *               passwordMismatch:
 *                 summary: Passwords do not match
 *                 value:
 *                   message: Passwords do not match
 *       500:
 *         description: Server error while resetting password
 *         content:
 *           application/json:
 *             example:
 *               message: Error resetting password
 *               error: <error_message>
 */
router.post("/reset-password", resetPassword);
module.exports = router;
