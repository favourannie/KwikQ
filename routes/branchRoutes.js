const express = require('express');
const router = express.Router();
const {createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, branchLogin } = require('../controllers/branchController');
const { authenticate, adminAuth, Login  } = require('../middleware/authenticate');

/**
 * @swagger
 * /api/v1/create-branch:
 *   post:
 *     tags:
 *       - Branches
 *     summary: Create a new branch under an organization
 *     description: This endpoint allows an admin organization to create a new branch. Requires authentication via Bearer token.
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
 *               - city
 *               - state
 *               - serviceType
 *               - managerName
 *               - managerEmail
 *               - managerPhone
 *             properties:
 *               branchName:
 *                 type: string
 *                 example: Lekki Branch
 *               address:
 *                 type: string
 *                 example: 12 Admiralty Way
 *               city:
 *                 type: string
 *                 example: Lagos
 *               state:
 *                 type: string
 *                 example: Lagos State
 *               serviceType:
 *                 type: string
 *                 example: Financial Services
 *               managerName:
 *                 type: string
 *                 example: John Doe
 *               managerEmail:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               managerPhone:
 *                 type: string
 *                 example: +2348012345678
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
 *                       example: 6548c3bfc74f8f2e54e12a93
 *                     organizationId:
 *                       type: string
 *                       example: 6548a2e1f88a9e3d0bc92f33
 *                     branchName:
 *                       type: string
 *                       example: Lekki Branch
 *                     branchCode:
 *                       type: string
 *                       example: A1B2C3
 *                     address:
 *                       type: string
 *                       example: 12 Admiralty Way
 *                     city:
 *                       type: string
 *                       example: Lagos
 *                     state:
 *                       type: string
 *                       example: Lagos State
 *                     serviceType:
 *                       type: string
 *                       example: Financial Services
 *                     managerName:
 *                       type: string
 *                       example: John Doe
 *                     managerEmail:
 *                       type: string
 *                       example: johndoe@example.com
 *                     managerPhone:
 *                       type: string
 *                       example: +2348012345678
 *       400:
 *         description: Branch already exists or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch already exists
 *       401:
 *         description: Unauthorized or expired session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: session expired login to continue
 *       403:
 *         description: Forbidden — only admins can create branches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only admins can create branches
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
 *         description: Internal server error
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
 *                   example: Internal server error message
 */

router.post('/create-branch', authenticate, createBranch);
/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     tags:
 *       - Branches
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
 *       - Branches
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
router.get('/branch/:id', authenticate, getBranchById);

/**
 * @swagger
 * /api/v1/update-branch/{id}:
 *   patch:
 *     tags:
 *       - Branches
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
 *       - Branches
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
