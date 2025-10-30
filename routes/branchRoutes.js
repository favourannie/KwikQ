const express = require('express');
const router = express.Router();
const {createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, branchLogin } = require('../controllers/branchController');
const { authenticate, adminAuth  } = require('../middleware/authenticate');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - organization
 *         - industryServiceType
 *         - headOfficeAddress
 *         - city
 *         - state
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated branch ID
 *           example: 671be8bfcfd2b12aa46783fa
 *         organization:
 *           type: string
 *           description: ID of the organization this branch belongs to
 *           example: 671be8a2cfb2a9ba935ab04d
 *         businessName:
 *           type: string
 *           description: Business name of the branch
 *           example: Annie's Delight - VI Branch
 *         industryServiceType:
 *           type: string
 *           description: Type of industry or service
 *           example: Banking
 *         headOfficeAddress:
 *           type: string
 *           description: Physical address of the branch
 *           example: 45 Adeola Odeku Street
 *         city:
 *           type: string
 *           description: City where branch is located
 *           example: Lagos
 *         state:
 *           type: string
 *           description: State where branch is located
 *           example: Lagos State
 *         fullName:
 *           type: string
 *           description: Name of the branch manager
 *           example: John Doe
 *         emailAddress:
 *           type: string
 *           format: email
 *           description: Email address for the branch
 *           example: vi.branch@anniesdelight.com
 *         phoneNumber:
 *           type: string
 *           description: Contact number for the branch
 *           example: "+2348123456789"
 *         isActive:
 *           type: boolean
 *           description: Whether the branch is active
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Branch creation timestamp
 *           example: "2025-10-30T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2025-10-30T12:00:00.000Z"
 */

/**
 * @swagger
 * /api/v1/create-branch/{id}:
 *   post:
 *     summary: Create a new branch under an organization
 *     description: This endpoint allows an authenticated organization to create a new branch by providing the branch details.
 *     tags:
 *       - Branch Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization to associate the branch with
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - industryServiceType
 *               - headOfficeAddress
 *               - city
 *               - state
 *             properties:
 *               industryServiceType:
 *                 type: string
 *                 example: Banking
 *               headOfficeAddress:
 *                 type: string
 *                 example: 45 Adeola Odeku Street
 *               city:
 *                 type: string
 *                 example: Lagos
 *               state:
 *                 type: string
 *                 example: Lagos State
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               emailAddress:
 *                 type: string
 *                 example: johndoe@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348123456789"
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 671be8bfcfd2b12aa46783fa
 *                     organization:
 *                       type: string
 *                       example: 671be8a2cfb2a9ba935ab04d
 *                     businessName:
 *                       type: string
 *                       example: Annie's Delight
 *                     industryServiceType:
 *                       type: string
 *                       example: Banking
 *                     headOfficeAddress:
 *                       type: string
 *                       example: 45 Adeola Odeku Street
 *                     city:
 *                       type: string
 *                       example: Lagos
 *                     state:
 *                       type: string
 *                       example: Lagos State
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     emailAddress:
 *                       type: string
 *                       example: johndoe@example.com
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2348123456789"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Missing required fields
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating branch
 *                 error:
 *                   type: string
 *                   example: "Internal server error message"
 */

router.post('/create-branch' , authenticate, createBranch);
/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     tags:
 *       - Branch Management
 *     summary: Get all branches
 *     description: Retrieve all branches, optionally filtered by organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Organization ID to filter branches
 *     responses:
 *       200:
 *         description: List of branches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 message:
 *                   type: string
 *                   example: Branches fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Branch'
 *       500:
 *         description: Server error
 */
router.get('/branches', getAllBranches);

/**
 * @swagger
 * /api/v1/branch/{id}:
 *   get:
 *     tags:
 *       - Branch Management
 *     summary: Get branch by ID
 *     description: Retrieve detailed information about a specific branch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.get('/branch/:id', getBranchById);

/**
 * @swagger
 * /api/v1/update-branch/{id}:
 *   patch:
 *     tags:
 *       - Branch Management
 *     summary: Update branch details
 *     description: Update branch information. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: Annie's Delight - VI Branch
 *               industryServiceType:
 *                 type: string
 *                 example: Banking
 *               headOfficeAddress:
 *                 type: string
 *                 example: 45 Adeola Odeku Street
 *               city:
 *                 type: string
 *                 example: Lagos
 *               state:
 *                 type: string
 *                 example: Lagos State
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 example: vi.branch@anniesdelight.com
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348123456789"
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.patch('/update-branch/:id', authenticate,updateBranch);

/**
 * @swagger
 * /api/v1/delete-branch/{id}:
 *   delete:
 *     tags:
 *       - Branch Management
 *     summary: Delete a branch
 *     description: Delete a branch by ID. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Branch deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.delete('/delete-branch/:id', authenticate, deleteBranch);

/**
 * @swagger
 * /api/v1/branchlogin:
 *   post:
 *     tags:
 *       - Branch Authentication
 *     summary: Branch login endpoint
 *     description: Authenticate a branch user and get access token
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
 *                 example: branch@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "********"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 branch:
 *                   $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       404:
 *         description: Branch not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error during login
 *                 error:
 *                   type: string
 */
router.post('/branchlogin', branchLogin);

module.exports = router;
