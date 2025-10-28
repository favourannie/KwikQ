const express = require('express');
const router = express.Router();
const {getBranchManagement, createBranch, updateBranch, deleteBranch, viewBranchReports}  = require('../controllers/superAdminBranchMgt');

const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     BranchManagement:
 *       type: object
 *       required:
 *         - branchId
 *         - branchName
 *         - organization
 *       properties:
 *         branchId:
 *           type: string
 *           description: MongoDB ObjectId of the branch
 *           example: "507f1f77bcf86cd799439011"
 *         branchName:
 *           type: string
 *           description: Display name of the branch
 *           example: "Downtown Branch"
 *         branchCode:
 *           type: string
 *           description: Short human-readable branch code
 *           example: "DT-001"
 *         address:
 *           type: string
 *           example: "123 Main Street"
 *         city:
 *           type: string
 *           example: "Lagos"
 *         state:
 *           type: string
 *           example: "Lagos State"
 *         organization:
 *           type: string
 *           description: Organization ObjectId this branch belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         organizationName:
 *           type: string
 *           example: "Global Bank Ltd"
 *         managerName:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "branch@example.com"
 *         phoneNumber:
 *           type: string
 *           example: "+2348001234567"
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: active
 *         operation:
 *           type: object
 *           description: Operational metadata for the branch
 *         permission:
 *           type: object
 *           description: Permission configuration
 *         notification:
 *           type: object
 *           description: Notification settings for the branch
 *         queuesToday:
 *           type: integer
 *           minimum: 0
 *           example: 4
 *         customersServed:
 *           type: integer
 *           minimum: 0
 *           example: 120
 *         avgWaitTime:
 *           type: number
 *           minimum: 0
 *           example: 8.5
 *     BranchReport:
 *       type: object
 *       required:
 *         - branchName
 *         - organizationName
 *       properties:
 *         branchName:
 *           type: string
 *         organizationName:
 *           type: string
 *         totalCustomers:
 *           type: integer
 *           minimum: 0
 *         servedCustomers:
 *           type: integer
 *           minimum: 0
 *         pendingCustomers:
 *           type: integer
 *           minimum: 0
 *         avgWaitTime:
 *           type: number
 *         queuesToday:
 *           type: integer
 *         lastLogin:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/management:
 *   get:
 *     tags:
 *       - Branch Management
 *     summary: Get branch management overview
 *     description: |
 *       Retrieves all branches with optional filtering by organization and status. Returns summary analytics
 *       and per-branch details. The endpoint will update SuperAdminDashboard overview as a side-effect.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Optional organization ObjectId to filter branches
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Optional branch status filter
 *     responses:
 *       200:
 *         description: Branch management data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - totalBranches
 *                 - branchManagement
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalBranches:
 *                   type: integer
 *                   example: 10
 *                 totalActive:
 *                   type: integer
 *                   example: 8
 *                 totalInactive:
 *                   type: integer
 *                   example: 2
 *                 totalQueues:
 *                   type: integer
 *                 totalCustomers:
 *                   type: integer
 *                 branchManagement:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BranchManagement'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       500:
 *         description: Server error
 */
router.get('/management', authenticate, adminAuth, getBranchManagement);

/**
 * @swagger
 * /api/v1/createbranch:
 *   post:
 *     tags:
 *       - Branch Management
 *     summary: Create a new branch
 *     description: |
 *       Creates a new branch document and updates the SuperAdminDashboard counts.
 *       Validates that the provided organization exists before creating the branch.
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
 *               - branchName
 *             properties:
 *               organization:
 *                 type: string
 *                 description: Organization ObjectId
 *                 example: "507f1f77bcf86cd799439012"
 *               branchName:
 *                 type: string
 *                 example: "Downtown Branch"
 *               branchCode:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               managerName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - newBranch
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch created successfully
 *                 newBranch:
 *                   $ref: '#/components/schemas/BranchManagement'
 *       400:
 *         description: Organization ID is required or invalid payload
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
router.post('/createbranch', authenticate, adminAuth, createBranch);

/**
 * @swagger
 * /api/v1/updatebranch/{id}:
 *   put:
 *     tags:
 *       - Branch Management
 *     summary: Update branch details
 *     description: Updates a branch by id and returns the updated document.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ObjectId to update
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchManagement'
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - updatedBranch
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch updated successfully
 *                 updatedBranch:
 *                   $ref: '#/components/schemas/BranchManagement'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.put('/updatebranch/:id', authenticate, adminAuth, updateBranch);

/**
 * @swagger
 * /api/v1/deletebranch/{id}:
 *   delete:
 *     tags:
 *       - Branch Management
 *     summary: Delete a branch
 *     description: |
 *       Removes a branch by id and decrements the SuperAdminDashboard totalBranches counter.
 *       This operation is permanent for the branch document.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ObjectId to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.delete('/deletebranch/:id',authenticate, adminAuth, deleteBranch);

/**
 * @swagger
 * /api/v1/{branchId}/{id}/report:
 *   get:
 *     tags:
 *       - Branch Management
 *     summary: Get branch report
 *     description: |
 *       Retrieves a report for a specific branch including customer analytics. Note: the route currently accepts
 *       two path segments; the controller uses `branchId` (first segment) to fetch the branch. The second `id`
 *       segment is accepted by the route but ignored by the implementation — keep it for backward compatibility.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ObjectId used to locate the branch
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Legacy/unused id path segment retained for compatibility
 *     responses:
 *       200:
 *         description: Branch report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - report
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch report fetched successfully
 *                 report:
 *                   $ref: '#/components/schemas/BranchReport'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.get('/:branchId/:id/report', authenticate, adminAuth, viewBranchReports);

module.exports = router;
