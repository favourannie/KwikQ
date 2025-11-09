const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { getDashboardMetrics, getRecentActivity,} = require("../controllers/dashboardController");
/**
 * @swagger
 * /api/v1/dashboard/{id}:
 *   get:
 *     summary: Get dashboard metrics for a business
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the business (organization or branch)
 *         schema:
 *           type: string
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
 *                   example: "Dashboard metrics fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeInQueue:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 12
 *                         percentageChange:
 *                           type: integer
 *                           example: 15
 *                     averageWaitTime:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 25
 *                         percentageChange:
 *                           type: integer
 *                           example: 10
 *                     servedToday:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 30
 *                         percentageChange:
 *                           type: integer
 *                           example: 5
 *       403:
 *         description: Unauthorized role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized role"
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
 *                 error:
 *                   type: string
 *                   example: "Some server error message"
 */
router.get("/dashboard/:id", authenticate, getDashboardMetrics);

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
