const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { getDashboardMetrics,} = require("../controllers/dashboardController");

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Retrieve organization dashboard metrics
 *     description: >
 *       Returns key real-time metrics for the organization's dashboard such as 
 *       the number of active customers in queue, average waiting time, 
 *       and total customers served today.  
 *       It compares current metrics with the previous day's data to show performance changes.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeInQueue:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 25
 *                         percentageChange:
 *                           type: number
 *                           example: 12
 *                           description: Percentage change compared to yesterday
 *                     averageWaitTime:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: number
 *                           example: 7
 *                           description: Average waiting time in minutes
 *                         percentageChange:
 *                           type: number
 *                           example: -3
 *                           description: Percentage change compared to yesterday
 *                     servedToday:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 145
 *                           description: Number of customers served today
 *                         percentageChange:
 *                           type: number
 *                           example: 15
 *                           description: Percentage change compared to yesterday
 *       400:
 *         description: Error getting dashboard metrics
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
 *                   example: Invalid branch ID or database error
 */

router.get("/dashboard", getDashboardMetrics);
// router.get("/queue-status", authenticate, getQueuePointsStatus);

module.exports = router;