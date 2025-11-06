const express = require('express');
const router = express.Router();
const {getBranchManagement, getBranchById, viewBranchReports}  = require('../controllers/superAdminBranchMgt');

const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * /api/v1/branch-management:
 *   get:
 *     summary: Retrieve branch management analytics for all branches under an organization
 *     description: >
 *       This endpoint fetches branch-level and overall analytics for the Super Admin dashboard.
 *       It calculates metrics such as active queues, served customers, and average wait times.
 *       Data can be filtered by organization and branch status.
 *
 *     tags:
 *       - Super Admin Dashboard
 *
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional organization ID to filter branches by organization.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         required: false
 *         description: Optional filter to return branches by their current status.
 *
 *     responses:
 *       200:
 *         description: Successfully retrieved branch management data and overview analytics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch management data retrieved successfully
 *                 overview:
 *                   type: object
 *                   properties:
 *                     totalBranches:
 *                       type: integer
 *                       example: 5
 *                     totalActive:
 *                       type: integer
 *                       example: 3
 *                     totalInactive:
 *                       type: integer
 *                       example: 2
 *                     totalQueues:
 *                       type: integer
 *                       example: 56
 *                     totalServed:
 *                       type: integer
 *                       example: 42
 *                     totalAvgWaitTime:
 *                       type: number
 *                       format: float
 *                       example: 8.5
 *                 branchManagement:
 *                   type: array
 *                   description: List of branch analytics and status details.
 *                   items:
 *                     type: object
 *                     properties:
 *                       branchId:
 *                         type: string
 *                         example: 67377e8c5a8e2b1d4f3a1234
 *                       branchName:
 *                         type: string
 *                         example: Main Office
 *                       branchCode:
 *                         type: string
 *                         example: Q001
 *                       address:
 *                         type: string
 *                         example: 123 Broad Street
 *                       city:
 *                         type: string
 *                         example: Lagos
 *                       state:
 *                         type: string
 *                         example: Lagos State
 *                       organizationId:
 *                         type: string
 *                         example: 67377e8c5a8e2b1d4f3a5678
 *                       organizationName:
 *                         type: string
 *                         example: Queueless Global
 *                       managerName:
 *                         type: string
 *                         example: John Doe
 *                       managerEmail:
 *                         type: string
 *                         example: john.doe@queueless.com
 *                       phoneNumber:
 *                         type: string
 *                         example: "+2348012345678"
 *                       lastLogin:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-06T08:25:14.000Z"
 *                       status:
 *                         type: string
 *                         enum: [active, inactive]
 *                         example: active
 *                       notification:
 *                         type: boolean
 *                         example: false
 *                       queuesToday:
 *                         type: integer
 *                         example: 15
 *                       servedToday:
 *                         type: integer
 *                         example: 12
 *                       avgWaitTime:
 *                         type: number
 *                         format: float
 *                         example: 6.75
 *                       percentageChange:
 *                         type: object
 *                         properties:
 *                           activeQueue:
 *                             type: number
 *                             example: 25
 *                           served:
 *                             type: number
 *                             example: 10
 *                           waitTime:
 *                             type: number
 *                             example: -5
 *
 *       404:
 *         description: No branches found for the given filter criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No branches found for this filter
 *
 *       500:
 *         description: Internal server error while retrieving branch management data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error in getBranchManagement
 *                 error:
 *                   type: string
 *                   example: "TypeError: Cannot read property 'organizationName' of undefined"
 */
router.get('/branch-management', authenticate, getBranchManagement);

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
 *      - Branch Management
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

module.exports = router;
