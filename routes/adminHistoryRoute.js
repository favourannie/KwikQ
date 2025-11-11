const express = require("express")
const { getQueueHistory } = require("../controllers/adminHistoryController")
const router = express.Router()

/**
 * @swagger
 * /api/v1/history/{id}:
 *   get:
 *     summary: Get queue history for a business
 *     description: >
 *       Fetches the queue history for an organization or branch by their unique ID.  
 *       Returns all customers with details like queue number, customer name, service type, timestamps, wait time, service time, and status.
 *     tags:
 *       - Queue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the organization or branch
 *         schema:
 *           type: string
 *           example: 6730e5a2a8f43b0012f4c1de
 *     responses:
 *       200:
 *         description: Queue history fetched successfully
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       queueNumber:
 *                         type: string
 *                         example: A102
 *                       customerName:
 *                         type: string
 *                         example: John Doe
 *                       serviceType:
 *                         type: string
 *                         example: Account Opening
 *                       joinedDate:
 *                         type: string
 *                         example: 2025-11-11
 *                       joinedTime:
 *                         type: string
 *                         example: 10:30
 *                       waitTime:
 *                         type: string
 *                         example: 15 min
 *                       serviceTime:
 *                         type: string
 *                         example: 20 min
 *                       status:
 *                         type: string
 *                         example: completed
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching queue history: Cast to ObjectId failed for value "abc123"
 *                 error:
 *                   type: string
 *                   example: Cast to ObjectId failed for value "abc123"
 */

router.get("/history/:id", getQueueHistory )
module.exports = router