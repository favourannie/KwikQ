const express = require("express")
const { getNotifications } = require("../controllers/adminNotificationController")
const router = express.Router()

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Get notifications for a business (organization or branch)
 *     description: |
 *       Fetches all queue-related notifications for a given organization or branch based on its role.  
 *       Returns total notifications, number of high-priority notifications, and details for each.
 *     tags:
 *       - Notifications
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the organization or branch to get notifications for
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         required: true
 *         description: The business role type. Must be either 'branch' (branch) or 'individual' (single business)
 *         schema:
 *           type: string
 *           enum: [branch, individual]
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifications fetched successfully
 *                 totalNotifications:
 *                   type: integer
 *                   example: 5
 *                 highPriorityCount:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                         example: John Doe joined the queue for loanCollection
 *                       queueNumber:
 *                         type: string
 *                         example: KQ-123ABC
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-11-06T21:30:00.000Z
 *                       priority:
 *                         type: string
 *                         example: high
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Invalid or missing role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role must be either 'multi' or 'individual'
 *       500:
 *         description: Server error fetching notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching notifications
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

router.get("/notifications/:id", getNotifications)
module.exports = router