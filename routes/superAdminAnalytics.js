const express = require('express');
const router = express.Router();
const {getDashboardMetrics, getFilteredDashboardData,getBranchPerformance,  getServiceDistribution,getBranchAnalytics } = require('../controllers/superAdminAnalytics');
const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * /api/v1/getanalytics:
 *   get:
 *     summary: Get dashboard analytics metrics
 *     description: |
 *       Fetches overall dashboard metrics for the specified organization, including:
 *       - Total customers for the current week  
 *       - Percentage change compared to last week  
 *       - Average customer wait time  
 *       - Customer flow trends across days of the week  
 *       
 *       If `organizationId` is not provided, data for all organizations is returned.
 *     tags:
 *       - Super Admin Analytics Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: false
 *         description: The ID of the organization to filter analytics by. If omitted, includes all organizations.
 *         schema:
 *           type: string
 *         example: 670e23b90082201c89caafb8d
 *     responses:
 *       200:
 *         description: Dashboard analytics metrics fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard metrics fetched successfully
 *                 totalCustomers:
 *                   type: array
 *                   description: List of customers created during the current week.
 *                   items:
 *                     type: object
 *                     example:
 *                       _id: 673b92116f42d2f42b9e9b23
 *                       name: John Doe
 *                       createdAt: 2025-11-09T08:15:42.000Z
 *                 customerChangePercent:
 *                   type: string
 *                   description: Percentage change in customer count compared to last week.
 *                   example: "15.3"
 *                 avgWaitTime:
 *                   type: string
 *                   description: Average customer wait time (in minutes).
 *                   example: "12"
 *                 trends:
 *                   type: array
 *                   description: Customer activity trends throughout the week (Monday–Sunday).
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: Mon
 *                       totalCustomers:
 *                         type: number
 *                         example: 35
 *                       avgWait:
 *                         type: number
 *                         example: 8
 *       400:
 *         description: Invalid organizationId or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organizationId provided.
 *       500:
 *         description: Server error while fetching dashboard metrics.
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
 *                   example: Cannot read property 'organizationId' of undefined
 */
router.get('/getanalytics',authenticate, getDashboardMetrics);

/**
 * @swagger
 * /api/v1/getfiltered:
 *   get:
 *     summary: Get filtered dashboard data
 *     description: |
 *       Fetches filtered dashboard analytics data based on the provided **organization ID** and **time range**.  
 *       
 *       - The `organizationId` determines which organization’s data to retrieve.  
 *       - The `timeRange` parameter specifies the time period for filtering analytics.  
 *       - If `organizationId` is `"all"`, data for all organizations is returned.
 *       
 *       **Supported time ranges:**
 *       - `today` → Current day  
 *       - `thisWeek` → Current ISO week (Monday–Sunday)  
 *       - `thisMonth` → Current month  
 *       
 *       If no `timeRange` is provided, defaults to `today`.
 *     tags:
 *       - Super Admin Analytics Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: false
 *         description: The ID of the organization to filter dashboard data. Use `"all"` for all organizations.
 *         schema:
 *           type: string
 *         example: 670e23b90082201c89caafb8d
 *       - in: query
 *         name: timeRange
 *         required: false
 *         description: The time range to filter dashboard data.
 *         schema:
 *           type: string
 *           enum: [today, thisWeek, thisMonth]
 *         example: thisWeek
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
 *                 organizationId:
 *                   type: string
 *                   example: 670e23b90082201c89caafb8d
 *                 timeRange:
 *                   type: string
 *                   example: thisWeek
 *                 totalCustomers:
 *                   type: array
 *                   description: List of customers created within the selected time range.
 *                   items:
 *                     type: object
 *                     example:
 *                       _id: 673b92116f42d2f42b9e9b23
 *                       name: John Doe
 *                       createdAt: 2025-11-09T08:15:42.000Z
 *                 avgWaitTime:
 *                   type: number
 *                   description: Average wait time (in minutes) for served customers.
 *                   example: 12
 *                 trends:
 *                   type: array
 *                   description: Daily customer traffic trend for the selected time range.
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: Mon
 *                       totalCustomers:
 *                         type: number
 *                         example: 45
 *       400:
 *         description: Invalid query parameters provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organizationId or timeRange.
 *       500:
 *         description: Server error while fetching filtered dashboard data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching filtered dashboard data
 *                 error:
 *                   type: string
 *                   example: Cannot read property 'organizationId' of undefined
 */
router.get('/getfiltered',authenticate, getFilteredDashboardData)

/**
 * @swagger
 * /api/v1/getservicedistribution:
 *   get:
 *     summary: Get service distribution
 *     description: Returns distribution of services across an organization or branch, including total counts and percentages.
 *     tags:
 *       - Super Admin Analytics Dashboard
 *     parameters:
 *       - in: query
 *         name: orgId
 *         required: false
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the organization
 *       - in: query
 *         name: branchId
 *         required: false
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the branch
 *     responses:
 *       200:
 *         description: Service distribution fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalServices:
 *                       type: integer
 *                       example: 150
 *                 distribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceType:
 *                         type: string
 *                         example: "Customer Support"
 *                       count:
 *                         type: integer
 *                         example: 50
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 33.33
 *       400:
 *         description: Invalid query parameter format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organizationId format
 *                 error:
 *                   type: string
 *                   example: Expected a valid MongoDB ObjectId
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch service distribution
 *                 error:
 *                   type: string
 *                   example: Some internal server error message
 */
router.get('/getservicedistribution', getServiceDistribution );

/**
 * @swagger
 * /api/v1/branchperformance:
 *   get:
 *     summary: Get branch performance for an organization
 *     description: Returns performance metrics for all branches under a specific organization, including customer counts, rankings, and chart data.
 *     tags:
 *       - Super Admin Analytics Dashboard
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the organization
 *     responses:
 *       200:
 *         description: Branch performance data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch performance data fetched successfully
 *                 organizationId:
 *                   type: string
 *                   example: 650c8f2b1234567890abcdef
 *                 totalBranches:
 *                   type: integer
 *                   example: 3
 *                 totalCustomers:
 *                   type: integer
 *                   example: 120
 *                 chartData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       branchName:
 *                         type: string
 *                         example: Main Branch
 *                       customerCount:
 *                         type: integer
 *                         example: 50
 *                 branchRankings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         example: 1
 *                       branchName:
 *                         type: string
 *                         example: Main Branch
 *                       customerCount:
 *                         type: integer
 *                         example: 50
 *                       percentage:
 *                         type: string
 *                         example: 41.7%
 *       400:
 *         description: Missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: organizationId query parameter is required
 *       404:
 *         description: Organization not found or no branches found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No branches found for this organization
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branch performance data
 *                 error:
 *                   type: string
 *                   example: Some internal server error message
 */
router.get("/branchperformance", getBranchPerformance);

/**
 * @swagger
 * /api/v1/branchanalytics:
 *   get:
 *     summary: Fetch branch analytics summary, trends, and hourly distributions
 *     description: |
 *       Returns customer flow statistics, wait time averages, and hourly distribution analytics for a branch or all branches.
 *       Requires authentication. Data range can be set to **today**, **week**, or **month**.
 *     tags: 
 *       - Super Admin Analytics Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *           example: all
 *         description: Specify branch ID or `'all'` for all branches.
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           example: today
 *         description: Defines the time range for analytics data.
 *     responses:
 *       201:
 *         description: Branch analytics data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch Analytics Fetched Successfully
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 1790
 *                         change:
 *                           type: string
 *                           example: "+12%"
 *                         comparison:
 *                           type: string
 *                           example: "vs last week"
 *                         trend:
 *                           type: string
 *                           enum: [up, down]
 *                           example: up
 *                     avgWaitTime:
 *                       type: object
 *                       properties:
 *                         time:
 *                           type: integer
 *                           example: 11
 *                         improvement:
 *                           type: string
 *                           example: "-8%"
 *                         label:
 *                           type: string
 *                           example: improvement
 *                         trend:
 *                           type: string
 *                           enum: [up, down]
 *                           example: down
 *                 trends:
 *                   type: object
 *                   description: Weekly customer flow and wait time trends
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
 *                     customers:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [200, 220, 250, 270, 300, 280, 260]
 *                     avgWait:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [12, 11, 10, 9, 10, 11, 12]
 *                 hourly:
 *                   type: object
 *                   description: Hourly customer distribution (0–23 hours)
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["9:00", "10:00", "11:00", "12:00", "13:00"]
 *                     customers:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [15, 40, 60, 55, 50]
 *                 filters:
 *                   type: object
 *                   description: Filter context for the returned data
 *                   properties:
 *                     branch:
 *                       type: string
 *                       example: "All Branches"
 *                     range:
 *                       type: string
 *                       example: "today"
 *                 branches:
 *                   type: array
 *                   description: List of branches available for analytics selection
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "654abc123def456789"
 *                       name:
 *                         type: string
 *                         example: "Main Branch (MB001)"
 *                 meta:
 *                   type: object
 *                   description: Metadata and timestamps for the analytics
 *                   properties:
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-13T08:00:00.000Z"
 *                     range:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-13T00:00:00.000Z"
 *                         end:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-13T23:59:59.000Z"
 *       401:
 *         description: Unauthorized – Missing or invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization ID required
 *       500:
 *         description: Server error while fetching analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching analytics
 *                 error:
 *                   type: string
 *                   example: Cannot read property 'id' of undefined
 */
router.get('/branchanalytics', authenticate, getBranchAnalytics);


module.exports = router;
