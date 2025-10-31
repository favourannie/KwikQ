const router = require('express').Router();
const { getBranchAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authenticate');

/**
 * @swagger
 * /api/v1/analytics/{branchId}:
 *   get:
 *     summary: Get branch analytics data
 *     description: >
 *       Fetches analytics for a specific branch within a given date range.  
 *       Returns customer traffic trends, service type distributions,  
 *       peak hours, satisfaction rates, and average wait times.
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         description: The ID of the branch to get analytics for
 *         schema:
 *           type: string
 *           example: "671f72d8c9b9d32f0a1a4e5b"
 *       - in: query
 *         name: startDate
 *         required: false
 *         description: Start date for analytics data (defaults to 7 days before endDate)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-10-01"
 *       - in: query
 *         name: endDate
 *         required: false
 *         description: End date for analytics data (defaults to current date)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-10-11"
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
 *                       type: integer
 *                       example: 120
 *                     avgWaitTime:
 *                       type: number
 *                       example: 8.5
 *                     weeklyCustomerVolume:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             example: "Mon"
 *                           count:
 *                             type: integer
 *                             example: 25
 *                     peakHours:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: integer
 *                             example: 14
 *                           count:
 *                             type: integer
 *                             example: 30
 *                     serviceTypesDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceType:
 *                             type: string
 *                             example: "Account Opening"
 *                           count:
 *                             type: integer
 *                             example: 15
 *                     satisfactionRate:
 *                       type: number
 *                       example: 86.7
 *                     analytics:
 *                       type: object
 *                       description: Stored analytics document created for the branch
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
 *                   example: Branch ID not found or invalid date range
 */

router.get('/analytics/:branchId', authenticate, getBranchAnalytics);

module.exports = router;
