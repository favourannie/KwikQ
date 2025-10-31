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
 *         - organizationId
 *         - branchName
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated branch ID
 *           example: 671be8bfcfd2b12aa46783fa
 *         organizationId:
 *           type: string
 *           description: ID of the organization this branch belongs to
 *           example: 671be8a2cfb2a9ba935ab04d
 *         branchName:
 *           type: string
 *           description: Human-friendly branch name
 *           example: Annie's Delight - VI Branch
 *         branchCode:
 *           type: string
 *           description: Auto-generated short branch code
 *           example: AB12CD
 *         address:
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
 *         serviceType:
 *           type: string
 *           description: Service or industry type the branch serves
 *           example: Banking
 *         managerName:
 *           type: string
 *           description: Branch manager's name
 *           example: John Doe
 *         managerEmail:
 *           type: string
 *           format: email
 *           description: Manager's contact email
 *           example: manager@branch.com
 *         managerPhone:
 *           type: string
 *           description: Manager's phone number
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
 * /api/v1/create-branch:
 *   post:
 *     summary: Create a new branch under the authenticated organization
 *     description: Creates a branch for the authenticated organization (uses the authenticated user's organization). Only admins can create branches.
 *     tags:
 *       - Branch Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchName
 *               - address
 *             properties:
 *               branchName:
 *                 type: string
 *                 example: "VI Branch"
 *               address:
 *                 type: string
 *                 example: "45 Adeola Odeku Street"
 *               city:
 *                 type: string
 *                 example: "Lagos"
 *               state:
 *                 type: string
 *                 example: "Lagos State"
 *               serviceType:
 *                 type: string
 *                 example: "Banking"
 *               managerName:
 *                 type: string
 *                 example: "John Doe"
 *               managerEmail:
 *                 type: string
 *                 format: email
 *                 example: "manager@branch.com"
 *               managerPhone:
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
 *                   $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Branch already exists or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch already exists
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       403:
 *         description: Forbidden - only admins can create branches
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
 */

router.post('/create-branch', authenticate, createBranch);
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
 *     description: Update branch information. Requires authentication.
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
 *               branchName:
 *                 type: string
 *                 example: "VI Branch"
 *               address:
 *                 type: string
 *                 example: "45 Adeola Odeku Street"
 *               city:
 *                 type: string
 *                 example: "Lagos"
 *               state:
 *                 type: string
 *                 example: "Lagos State"
 *               serviceType:
 *                 type: string
 *                 example: "Banking"
 *               managerName:
 *                 type: string
 *                 example: "Jane Smith"
 *               managerEmail:
 *                 type: string
 *                 format: email
 *                 example: "manager@branch.com"
 *               managerPhone:
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
 *     description: Delete a branch by ID. Requires authentication.
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
 *                 message:
 *                   type: string
 *                   example: Branch deleted successfully
 *                 deletedBranchId:
 *                   type: string
 *                   description: ID of the deleted branch
 *                   example: 671be8bfcfd2b12aa46783fa
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
 *     summary: Branch login by manager email and branch code
 *     description: Authenticate a branch using the manager's email and branch code. Returns basic branch details on success.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - managerEmail
 *               - branchCode
 *             properties:
 *               managerEmail:
 *                 type: string
 *                 format: email
 *                 example: manager@branch.com
 *               branchCode:
 *                 type: string
 *                 example: AB12CD
 *     responses:
 *       200:
 *         description: Branch login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch login successful
 *                 branch:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 671be8bfcfd2b12aa46783fa
 *                     branchName:
 *                       type: string
 *                       example: VI Branch
 *                     branchCode:
 *                       type: string
 *                       example: AB12CD
 *                     managerName:
 *                       type: string
 *                       example: John Doe
 *                     managerEmail:
 *                       type: string
 *                       format: email
 *                       example: manager@branch.com
 *       400:
 *         description: Missing managerEmail or branchCode
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Manager email and branch code are required
 *       404:
 *         description: Invalid manager email or branch code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid manager email or branch code
 *       500:
 *         description: Server error during branch login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error while logging in branch
 *                 error:
 *                   type: string
 */
router.post('/branchlogin', branchLogin);

module.exports = router;
