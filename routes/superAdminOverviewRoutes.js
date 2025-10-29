const express = require('express');
const router = express.Router();
const {getOverview, updateOverview} = require('../controllers/superAdminOverview');
const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * components:
 *   schemas:
 *     Overview:
 *       type: object
 *       required:
 *         - totalOrganizations
 *         - totalBranches
 *         - totalActiveQueues
 *         - totalCustomersServedToday
 *         - lastUpdated
 *       properties:
 *         totalOrganizations:
 *           type: integer
 *           description: Total count of all registered organizations in the system
 *           minimum: 0
 *           example: 25
 *         totalBranches:
 *           type: integer
 *           description: Aggregate count of branches across all organizations
 *           minimum: 0
 *           example: 50
 *         totalActiveQueues:
 *           type: integer
 *           description: Count of queues with 'active' status across all branches
 *           minimum: 0
 *           example: 30
 *         totalCustomersServedToday:
 *           type: integer
 *           description: Cumulative count of customers served since midnight (00:00:00) of the current day
 *           minimum: 0
 *           example: 150
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: ISO 8601 timestamp of when the overview data was last computed
 *           example: "2025-10-27T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/v1/getoverview:
 *   get:
 *     tags:
 *       - Super Admin Dashboard
 *     summary: Get real-time dashboard overview
 *     description: |
 *       Retrieves current overview statistics by performing real-time calculations:
 *       - Counts total organizations using Organization model
 *       - Counts total branches using Branch model
 *       - Counts active queues using Queue model
 *       - Aggregates customers served since midnight today
 *       - Updates the SuperAdminDashboard model with latest data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview data calculated and retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - overview
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Overview updated successfully
 *                 overview:
 *                   $ref: '#/components/schemas/Overview'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       403:
 *         description: Not authorized as admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin privileges required
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating overview
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 */
router.get('/getoverview', authenticate, adminAuth, getOverview);

/**
 * @swagger
 * /api/v1/updateoverview:
 *   put:
 *     tags:
 *       - Super Admin Dashboard
 *     summary: Manually update dashboard overview
 *     description: |
 *       Manually update the overview statistics in the super admin dashboard.
 *       This endpoint allows for manual overrides of the automatically calculated statistics.
 *       Use cases:
 *       - Correcting discrepancies in statistics
 *       - Testing dashboard displays
 *       - Handling special cases
 *       
 *       Note: Prefer using GET /getoverview for regular updates as it calculates real-time statistics.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - overview
 *             properties:
 *               overview:
 *                 $ref: '#/components/schemas/Overview'
 *           example:
 *             overview:
 *               totalOrganizations: 25
 *               totalBranches: 50
 *               totalActiveQueues: 30
 *               totalCustomersServedToday: 150
 *               lastUpdated: "2025-10-27T10:30:00.000Z"
 *     responses:
 *       200:
 *         description: Overview manually updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - overview
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Overview updated successfully
 *                 overview:
 *                   $ref: '#/components/schemas/Overview'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid overview data provided
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       403:
 *         description: Not authorized as admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin privileges required
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating overview
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 */
router.put('/updateoverview', authenticate, adminAuth,updateOverview);

module.exports = router;
