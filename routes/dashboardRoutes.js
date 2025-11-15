const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { getDashboardMetrics, getRecentActivity,} = require("../controllers/dashboardController");

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     description: Retrieve dashboard statistics including active customers in queue, served today, and average wait time.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dashboard metrics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeInQueue:
 *                       type: integer
 *                       example: 12
 *                       description: Number of customers currently waiting
 *                     servedToday:
 *                       type: integer
 *                       example: 5
 *                       description: Number of customers served today
 *                     avgWaitTime:
 *                       type: integer
 *                       example: 15
 *                       description: Average wait time in minutes
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Business not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting dashboard metrics"
 */

/**
 * Security scheme definition (usually in your swagger options)
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.get("/dashboard", authenticate, getDashboardMetrics);

/**
 * @swagger
 * /api/v1/recent-activity:
 *   get:
 *     summary: Get recent customer activities for the authenticated business
 *     description: Returns the 10 most recent customer activities (e.g., joined queue, being served, served, alerted) for the authenticated organization or branch. Activities are derived from the latest updates to queue customers.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recent activity fetched successfully
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       queueNumber:
 *                         type: string
 *                         example: kQ-555DOU0
 *                       action:
 *                         type: string
 *                         description: The action performed by the customer
 *                         example: Served
 *                         enum: [Served, Joined queue, Being served, Alert sent]
 *                       timeAgo:
 *                         type: string
 *                         description: Relative time since the last update
 *                         example: 5 min ago
 *       401:
 *         description: Unauthorized - Token is missing or invalid
 *       404:
 *         description: Business not found
 *       500:
 *         description: Error fetching recent activity
 */
router.get("/recent-activity", authenticate, getRecentActivity)
module.exports = router;
