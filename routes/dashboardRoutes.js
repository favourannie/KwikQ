const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { getDashboardMetrics, getRecentActivity,} = require("../controllers/dashboardController");
/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard metrics
 *     description: Fetch key metrics for the authenticated business, including active queue count, average wait time, and customers served today with percentage change compared to yesterday.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard metrics fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeInQueue:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 5
 *                           description: Number of customers currently in queue
 *                         percentageChange:
 *                           type: integer
 *                           example: 10
 *                           description: Percentage change compared to yesterday
 *                     averageWaitTime:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 12
 *                           description: Average wait time in minutes for today
 *                         percentageChange:
 *                           type: integer
 *                           example: -5
 *                           description: Percentage change compared to yesterday
 *                     servedToday:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 8
 *                           description: Number of customers served today
 *                         percentageChange:
 *                           type: integer
 *                           example: 20
 *                           description: Percentage change compared to yesterday
 *       404:
 *         description: Business or dashboard not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error getting dashboard metrics
 *                 error:
 *                   type: string
 *                   example: Internal server error message
 */

router.get("/dashboard", authenticate, getDashboardMetrics);

/**
 * @swagger
 * /api/v1/recent-activity/{id}:
 *   get:
 *     summary: Get recent customer activities for a business
 *     description: Returns the 10 most recent customer activities (e.g., joined queue, being served, served, alerted) for the specified organization or branch.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization or branch
 *         schema:
 *           type: string
 *           example: 6733b9f148d1a22c86b5f22b
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
 *                         example: Served
 *                       timeAgo:
 *                         type: string
 *                         example: 5 min ago
 *       401:
 *         description: Unauthorized - Token is missing or invalid
 *       404:
 *         description: Business not found
 *       500:
 *         description: Error fetching recent activity
 */

router.get("/recent-activity/:id", authenticate, getRecentActivity)
module.exports = router;
