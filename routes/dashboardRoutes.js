const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { getDashboardMetrics,} = require("../controllers/dashboardController");
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

module.exports = router;
