const express = require('express');
const router = express.Router();
const {getBranchManagement, getBranchById, getAllBranchesWithStats,getAllBranches, }  = require('../controllers/superAdminBranchMgt');

const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * /api/v1/branchoverview:
 *   get:
 *     summary: Get Branch Management Overview
 *     description: >
 *       Fetches an overview of all branches under an organization, including statistics like 
 *       total branches, active queues, average wait time, and served customers for today and yesterday.  
 *       Requires authentication.
 *     tags:
 *       - Branch Management
 *     security:
 *       - bearerAuth: []  # Requires JWT or access token
 *     responses:
 *       200:
 *         description: Branch management overview successfully fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch Overview Successfully Fetched
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalBranches:
 *                       type: string
 *                       example: "8 +2 this month"
 *                     activeQueues:
 *                       type: string
 *                       example: "15 +25% from yesterday"
 *                     avgWaitTime:
 *                       type: string
 *                       example: "12 min"
 *                     servedToday:
 *                       type: string
 *                       example: "120 +15% from yesterday"
 *                 branches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "671a32b4c53d1b00123abf90"
 *                       branchName:
 *                         type: string
 *                         example: "Victoria Island Branch"
 *                       branchCode:
 *                         type: string
 *                         example: "VIC-001"
 *                       city:
 *                         type: string
 *                         example: "Lagos"
 *                       state:
 *                         type: string
 *                         example: "Lagos State"
 *                       address:
 *                         type: string
 *                         example: "10 Adeola Odeku Street, Victoria Island"
 *                       managerName:
 *                         type: string
 *                         example: "Emeka Obi"
 *                       status:
 *                         type: string
 *                         enum: [Active, Offline]
 *                         example: "Active"
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-13T10:32:00.000Z"
 *                       activeQueue:
 *                         type: integer
 *                         example: 5
 *                       servedToday:
 *                         type: integer
 *                         example: 22
 *                       avgWaitTime:
 *                         type: integer
 *                         example: 10
 *                 meta:
 *                   type: object
 *                   properties:
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-13T07:32:00.000Z"
 *                     organizationId:
 *                       type: string
 *                       example: "6721a8a7b78e4d001245b932"
 *                     activeCount:
 *                       type: integer
 *                       example: 6
 *                     offlineCount:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization ID required
 *       500:
 *         description: Server error while fetching branch overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branch Overview
 *                 error:
 *                   type: string
 *                   example: "TypeError: Cannot read property 'organizationId' of undefined"
 */

router.get('/branchoverview', authenticate, getBranchManagement);

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

/**
 * @swagger
 * /api/v1/getall/{id}:
 *   get:
 *     summary: Retrieve all branches for an organization
 *     description: Fetches all branches associated with a specific organization by its ID.
 *     tags:
 *       - Branches
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the organization
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of branches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64f7b2c3e5b9b2f4a8a3d6f0"
 *                   name:
 *                     type: string
 *                     example: "Main Branch"
 *                   address:
 *                     type: string
 *                     example: "123 Main St, City, Country"
 *       500:
 *         description: Failed to fetch branches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch branches"
 *                 error:
 *                   type: string
 *                   example: "Database error"
 */
router.get('/getall', getAllBranches);

module.exports = router;
