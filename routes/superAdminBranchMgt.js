const express = require('express');
const router = express.Router();
const {getBranchManagement, getBranchById, viewBranchReports, getAllBranchesWithStats}  = require('../controllers/superAdminBranchMgt');

const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * /api/v1/branch-management/{dashboardId}:
 *   get:
 *     summary: Get Super Admin Dashboard Data by Dashboard ID
 *     description: >
 *       Returns the latest metrics overview for the Super Admin dashboard, including totals for organizations, branches, queues, customers served today, and average wait time.
 *     tags:
 *       - Super Admin Branch Management
 *     parameters:
 *       - in: path
 *         name: dashboardId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the Super Admin dashboard record.
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Super admin dashboard data fetched successfully
 *                 dashboardId:
 *                   type: string
 *                   example: 6737f83313e1a57a0f7d41cc
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBranches:
 *                       type: integer
 *                       example: 45
 *                     totalActiveQueues:
 *                       type: integer
 *                       example: 12
 *                     totalCustomersServedToday:
 *                       type: integer
 *                       example: 220
 *                     avgWaitTime:
 *                       type: number
 *                       format: float
 *                       example: 4.8
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-06T21:25:00.000Z
 *       400:
 *         description: Missing or invalid Dashboard ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard ID is required
 *       404:
 *         description: Dashboard not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching super admin dashboard data
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

router.get('/branch-management', authenticate, getBranchManagement);

/**
 * @swagger
 * /api/v1/{branchId}/{id}/report:
 *   get:
 *     tags:
 *       - Super Admin Branch Management
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
router.get('/:branchId/:id/report', authenticate, viewBranchReports);

/**
 * paths:
 * /api/branches/{id}:
 *  get:
 *    summary: Get a specific branch by ID
 *    description: >
 *      Retrieves details of a single branch by its ID.  
 *      Accessible only to authenticated admin users of an organization.
 *    tags:
 *      - Super Admin Branch Management
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: The unique ID of the branch
 *        schema:
 *          type: string
 *          example: "672fbe908e56a21b845fbc12"
 *    responses:
 *      '200':
 *        description: Branch fetched successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Branch fetched successfully
 *                data:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      example: "672fbe908e56a21b845fbc12"
 *                    branchName:
 *                      type: string
 *                      example: "Ikeja Branch"
 *                    city:
 *                      type: string
 *                      example: "Lagos"
 *                    state:
 *                      type: string
 *                      example: "Lagos State"
 *                    manager:
 *                      type: string
 *                      example: "John Doe"
 *                    branchCode:
 *                      type: string
 *                      example: "BRCH-001"
 *                    organizationId:
 *                      type: object
 *                      properties:
 *                        _id:
 *                          type: string
 *                          example: "672fbd558e56a21b845fbc09"
 *                        organizationName:
 *                          type: string
 *                          example: "Techwave Global Ltd."
 *                        managerName:
 *                          type: string
 *                          example: "Jane Smith"
 *                        managerEmail:
 *                          type: string
 *                          example: "jane@techwave.com"
 *      '401':
 *        description: Unauthorized - Missing or invalid token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Access denied. No token provided or invalid token."
 *      '404':
 *        description: Branch not found or not part of organization
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Branch not found or not part of your organization"
 *      '500':
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                   example: "Error fetching branch"
 *                error:
 *                  type: string
 *                  example: "Database connection failed"
 */
router.get("/branches/:id", authenticate, getBranchById);

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: Get all branches with analytics
 *     description: >
 *       Fetch all branches along with total active queues, average wait time, and customers served today.
 *     tags:
 *       - Super Admin Branch Management
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         description: Filter branches by organization ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: active
 *         description: Filter branches by status (e.g., active, inactive)
 *     responses:
 *       200:
 *         description: Branch analytics data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branches with analytics fetched successfully
 *                 totalBranches:
 *                   type: integer
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 6737fa91313e1a57a0f7d41cc
 *                       branchName:
 *                         type: string
 *                         example: Victoria Island Branch
 *                       city:
 *                         type: string
 *                         example: Lagos
 *                       state:
 *                         type: string
 *                         example: Lagos
 *                       status:
 *                         type: string
 *                         example: active
 *                       organizationId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6728fe9d2af68f3f7e5a1a22
 *                           organizationName:
 *                             type: string
 *                             example: FinTech Global Ltd
 *                           managerEmail:
 *                             type: string
 *                             example: info@fintechglobal.com
 *                       stats:
 *                         type: object
 *                         properties:
 *                           totalActiveQueues:
 *                             type: integer
 *                             example: 3
 *                           avgWaitTime:
 *                             type: number
 *                             format: float
 *                             example: 5.4
 *                           totalCustomersServedToday:
 *                             type: integer
 *                             example: 25
 *       404:
 *         description: No branches found
 *       500:
 *         description: Server error fetching branches
 */
router.get('/branches', getAllBranchesWithStats);

module.exports = router;
