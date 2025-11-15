const express = require("express")
const { getNotifications } = require("../controllers/adminNotificationController")
const router = express.Router()
/**
 * @swagger
 * /api/v1/get-notifications/{id}:
 *   get:
 *     summary: Fetch queue notifications for a business (branch or individual)
 *     description: >
 *       Automatically detects whether the provided ID belongs to a **branch** or an **individual**.  
 *       Returns notifications of customers who joined the queue, including priority levels.
 *
 *     tags:
 *       - Notifications
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the business (branch or individual).
 *         schema:
 *           type: string
 *
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
 *                 totalNotifications:
 *                   type: number
 *                 highPriorityCount:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       queueNumber:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       priority:
 *                         type: string
 *                         enum: [high, normal]
 *                       isRead:
 *                         type: boolean
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
 *
 *       500:
 *         description: Server error while fetching notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

router.get("/notifications/:id", getNotifications)
module.exports = router