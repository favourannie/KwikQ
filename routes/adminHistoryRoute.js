const express = require("express")
const { getQueueHistory } = require("../controllers/adminHistoryController")
const router = express.Router()

/**
 * @swagger
 * /api/v1/queue/history/{id}:
 *   get:
 *     summary: Get queue history for an organization or branch
 *     description: >
 *       Fetches the queue history for a given organization or branch.
 *       Returns detailed customer queue data and performance metrics such as:
 *       - Average wait time  
 *       - Completed today  
 *       - Cancelled / No-show count
 *     tags:
 *       - Queue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The organization or branch ID
 *         schema:
 *           type: string
 *           example: 67390fb30a1e03c93538eabc
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
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     avgWaitTime:
 *                       type: integer
 *                       example: 15
 *                       description: Average wait time in minutes
 *                     cancelledNoShow:
 *                       type: integer
 *                       example: 2
 *                       description: Total number of cancelled or no-show customers
 *                 completedToday:
 *                   type: integer
 *                   example: 5
 *                   description: Number of customers who completed service today
 *                 data:
 *                   type: array
 *                   description: List of customers in queue
 *                   items:
 *                     type: object
 *                     properties:
 *                       queueNumber:
 *                         type: string
 *                         example: A12
 *                       fullName:
 *                         type: string
 *                         example: John Doe
 *                       service:
 *                         type: string
 *                         example: Account Opening
 *                       serviceTime:
 *                         type: string
 *                         example: 12 min
 *                       status:
 *                         type: string
 *                         enum: [waiting, in_service, completed, canceled, no_show]
 *                         example: completed
 *                       phone:
 *                         type: string
 *                         example: "+2348012345678"
 *                       joinedAt:
 *                         type: string
 *                         example: "13 Nov 2025, 02:45:30 PM GMT+1"
 *                       waitTime:
 *                         type: string
 *                         example: "10 min"
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
 *         description: Error fetching queue data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching queue data
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.get("/history/:id", getQueueHistory )
module.exports = router