const express = require('express');
const router = express.Router();
const {getBranchManagement, getBranchById, getAllBranchesWithStats,getAllBranches, }  = require('../controllers/superAdminBranchMgt');

const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * /api/v1/branch/management/{id}:
 *   get:
 *     summary: Get branch management dashboard metrics for an organization
 *     description: >
 *       This endpoint retrieves dashboard data for all branches under a specific organization,
 *       including total branches, active queues, average wait time, and total customers served today.
 *     tags:
 *       - Branch Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The organization ID.
 *         schema:
 *           type: string
 *           example: "672f0db85f9d9c3a5d3b7b2a"
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard data fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBranches:
 *                       type: integer
 *                       example: 8
 *                     totalActiveQueues:
 *                       type: integer
 *                       example: 3
 *                     avgWaitTime:
 *                       type: string
 *                       example: "12 min"
 *                     totalServedToday:
 *                       type: integer
 *                       example: 45
 *       400:
 *         description: Bad request — missing or invalid organization ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organization ID
 *       401:
 *         description: Unauthorized — missing or invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error while fetching dashboard data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching dashboard metrics
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.get('/branch/management/:id/', authenticate, getBranchManagement);

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
 * /api/v1/getallbranches:
 *   get:
 *     summary: Get all branches with analytics and stats
 *     description: Fetch all branches belonging to a specific organization, including analytics or performance statistics if available.
 *     tags:
 *       - Super Admin Branch Management
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization whose branches you want to fetch.
 *     responses:
 *       200:
 *         description: Successfully fetched all branches with analytics data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branches with analytics fetched successfully
 *                 branch:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "671a94bf2e87d36ac4dc219c"
 *                       name:
 *                         type: string
 *                         example: "Victoria Island Branch"
 *                       city:
 *                         type: string
 *                         example: "Lagos"
 *                       organizationId:
 *                         type: string
 *                         example: "671a94bf2e87d36ac4dc2177"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-07T12:30:45.000Z"
 *       400:
 *         description: Missing or invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: organizationId is required
 *       500:
 *         description: Internal server error while fetching branches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branches with stats
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/getallbranches', getAllBranchesWithStats);


router.get('/getall', getAllBranches)

module.exports = router;
