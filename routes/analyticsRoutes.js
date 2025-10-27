const router = require('express').Router();
const { getBranchAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authenticate');

/**
 * @swagger
 * /api/v1/analytics/{branchId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics for a specific branch
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get('/analytics/:branchId', getBranchAnalytics);

module.exports = router;