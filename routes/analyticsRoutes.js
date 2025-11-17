const router = require('express').Router();
const { getBranchAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authenticate');

/**
 * @swagger
 * api/v1/analytics/{id}:
 *   get:
 *     summary: Get branch or individual analytics (last 7 days)
 *     description: Fetches analytics for a branch or individual organization for the last 7 days. 
 *                  Returns total customers, average wait time, customer traffic patterns, 
 *                  peak hours, service type distribution, satisfaction rate, and an analytics snapshot.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The organization ID or branch ID
 *     responses:
 *       200:
 *         description: Analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Analytics fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: number
 *                       example: 1144
 *                     avgWaitTime:
 *                       type: number
 *                       example: 11.9
 *                     weeklyCustomerVolume:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             example: Mon
 *                           count:
 *                             type: number
 *                             example: 156
 *                     peakHours:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: number
 *                             example: 14
 *                           count:
 *                             type: number
 *                             example: 42
 *                     serviceTypesDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceType:
 *                             type: string
 *                             example: Loan Inquiry
 *                           count:
 *                             type: number
 *                             example: 120
 *                     satisfactionRate:
 *                       type: string
 *                       example: "87.5"
 *                     analytics:
 *                       type: object
 *                       description: Snapshot of the analytics saved to the database
 *
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *
 *       500:
 *         description: Error fetching analytics
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
 *                   example: Unexpected server error
 */

router.get('/analytics/:id', authenticate, getBranchAnalytics);

module.exports = router;
