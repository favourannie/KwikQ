const express = require("express")
const { getQueueHistory } = require("../controllers/adminHistoryController")
const router = express.Router()

/**
 * @swagger
 * /api/v1/history/{id}:
 *   get:
 *     summary: Get queue history by ID
 *     description: Fetches a list of queue history records for a given branch or customer, with optional date range filters.
 *     tags:
 *       - Queue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier (can represent a customer or queue).
 *         schema:
 *           type: string
 *           example: 64a8c9d4f3b2a12d5c4e8f91
 *       - in: query
 *         name: branchId
 *         required: false
 *         description: Filter queue history by branch ID.
 *         schema:
 *           type: string
 *           example: 64b1e2d9c3a4b9f12c8e7f21
 *       - in: query
 *         name: startDate
 *         required: false
 *         description: Start date for filtering queue history (ISO format).
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-10-01
 *       - in: query
 *         name: endDate
 *         required: false
 *         description: End date for filtering queue history (ISO format).
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-10-31
 *     responses:
 *       200:
 *         description: Queue history fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Queue history fetched successfully
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       queueNumber:
 *                         type: string
 *                         example: Q-1023
 *                       customerName:
 *                         type: string
 *                         example: John Doe
 *                       serviceType:
 *                         type: string
 *                         example: Account Opening
 *                       joinedDate:
 *                         type: string
 *                         example: 11/08/2025
 *                       joinedTime:
 *                         type: string
 *                         example: 10:45 AM
 *                       waitTime:
 *                         type: string
 *                         example: "15 min"
 *                       serviceTime:
 *                         type: string
 *                         example: "7 min"
 *                       status:
 *                         type: string
 *                         enum: [waiting, in_service, completed, canceled, no_show]
 *                         example: completed
 *       400:
 *         description: Invalid query or missing parameters.
 *       404:
 *         description: No queue history found for the given filters.
 *       500:
 *         description: Internal server error.
 */

router.get("/history/:id", getQueueHistory )
module.exports = router