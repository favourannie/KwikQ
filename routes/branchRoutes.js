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
 * /api/v1/create-branch:
 *   post:
 *     tags:
 *       - Branches
 *     summary: Create a new branch
 *     description: Create a new branch for an organization. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization
 *               - name
 *             properties:
 *               organizationName:
 *                 type: string
 *                 description: Organization ID
 *               industryServiceType:
 *                 type: string
 *                 description: Industry/Service Type
 *               headOfficeAddress:
 *                 type: string
 *                 description: Head Office Address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State
 *               fullName:
 *                 type: string
 *                 description: Full Name
 *               emailAddress:
 *                 type: string
 *                 description: Email Address
 *               phoneNumber:
 *                 type: string
 *                 description: Phone Number
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
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization ID and branch name are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Organization not found
 */
router.post('/create-branch', authenticate, adminAuth, createBranch);

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
