const express = require("express");
const { getAllQueues } = require("../controllers/adminQueueMgt");
const router = express.Router()

/**
 * @swagger
 * /api/v1/queues/{id}:
 *   get:
 *     summary: Get all queues for a specific business (organization or branch)
 *     description: Retrieves all active and past queues associated with a given business ID (organization or branch). Includes queue tickets and their statuses.
 *     tags:
 *       - Queue Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the organization or branch.
 *         schema:
 *           type: string
 *           example: 671b3f8d29e4c51a78df1234
 *     responses:
 *       200:
 *         description: Queues retrieved successfully or no queues found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Queue configuration fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 674b2f8a3cd5f918b2a6a134
 *                       organization:
 *                         type: string
 *                         example: 671b3f8d29e4c51a78df1234
 *                       branch:
 *                         type: string
 *                         example: 671b3f8d29e4c51a78df1234
 *                       totalActiveQueues:
 *                         type: number
 *                         example: 8
 *                       totalServedToday:
 *                         type: number
 *                         example: 52
 *                       avgWaitTime:
 *                         type: number
 *                         example: 6
 *                       queues:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 674b2f8a3cd5f918b2a6a134
 *                             queueTickets:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   ticketNumber:
 *                                     type: string
 *                                     example: Q-204
 *                                   customerName:
 *                                     type: string
 *                                     example: Jane Doe
 *                                   status:
 *                                     type: string
 *                                     enum: [waiting, alerted, skipped, served, removed]
 *                                     example: waiting
 *                                   createdAt:
 *                                     type: string
 *                                     format: date-time
 *                                     example: 2025-11-02T09:32:10.124Z
 *                                   servedAt:
 *                                     type: string
 *                                     format: date-time
 *                                     example: 2025-11-02T10:15:00.124Z
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
 *       500:
 *         description: Server error while fetching queue data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching business queues
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

router.get("/queues/:id", getAllQueues);

module.exports = router