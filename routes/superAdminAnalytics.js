const express = require('express');
const router = express.Router();
const {getDashboardMetrics, getFilteredDashboardData,  getServiceDistribution } = require('../controllers/superAdminAnalytics');
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

router.get('/getservicedistribution', getServiceDistribution );



module.exports = router;
