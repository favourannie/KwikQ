const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { getDashboardMetrics,} = require("../controllers/dashboardController");

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     description: Returns queue and service statistics for the specified branch or all branches.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: false
 *         description: The branch ID to get data for.
 *     responses:
 *       200:
 *         description: Successfully retrieved metrics
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
 *                     averageWaitTime:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: number
 *                           example: 8
 *                         percentageChange:
 *                           type: number
 *                           example: -5
 *                     servedToday:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 40
 *                         percentageChange:
 *                           type: number
 *                           example: 10
 *       404:
 *         description: Branch not found
 *       400:
 *         description: Error getting dashboard metrics
 */

router.get("/dashboard", getDashboardMetrics);
// router.get("/queue-status", authenticate, getQueuePointsStatus);

module.exports = router;