const express = require('express');
const router = express.Router();
const {createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch } = require('../controllers/branchController');
const { authenticate, adminAuth } = require('../middleware/authenticate');

/**
 * @swagger
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       required:
 *         - organization
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated branch ID
 *         organization:
 *           type: string
 *           description: ID of the organization this branch belongs to
 *         name:
 *           type: string
 *           description: Name of the branch
 *         location:
 *           type: string
 *           description: Physical location of the branch
 *         managerName:
 *           type: string
 *           description: Name of the branch manager
 *         contactNumber:
 *           type: string
 *           description: Contact number for the branch
 *         email:
 *           type: string
 *           format: email
 *           description: Email address for the branch
 */

/**
 * @swagger
 * /api/v1/create-branch/{id}:
 *   post:
 *     summary: Create a new branch under an organization
 *     description: This endpoint allows an authenticated organization to create a new branch by providing the branch details.
 *     tags:
 *       - Branch
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

router.post('/create-branch/:id', authenticate, createBranch);

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     tags:
 *       - Branches
 *     summary: Get all branches
 *     description: Retrieve all branches, optionally filtered by organization
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
 *       - Branches
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
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               managerName:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
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
router.patch('/update-branch/:id', authenticate, adminAuth, updateBranch);

/**
 * @swagger
 * /api/v1/delete-branch/{id}:
 *   delete:
 *     tags:
 *       - Branches
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
router.delete('/delete-branch/:id', authenticate, adminAuth, deleteBranch);

module.exports = router;
