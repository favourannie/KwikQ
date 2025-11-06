const express = require("express");
const { getAllQueues, skipCustomer, removeCustomer, alertCustomer } = require("../controllers/adminQueueMgt");
const router = express.Router()

/**
 * @swagger
 * /api/v1/queues/{id}:
 *   get:
 *     summary: Get queue management data for a business
 *     description: >
 *       Retrieves all queue points and their associated customers for a specific business (organization or branch).
 *       It also returns key metrics such as total customers, total waiting customers, total served today, and the average wait time.
 *     tags:
 *       - Queue Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the organization or branch.
 *         schema:
 *           type: string
 *           example: 64b1d3e4c72a0f1b25a9a84d
 *     responses:
 *       200:
 *         description: Queue management data fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Queue management data fetched successfully"
 *               business:
 *                 name: "Zenith Bank Ikeja Branch"
 *                 type: "branch"
 *               stats:
 *                 totalCustomers: 35
 *                 totalWaiting: 12
 *                 totalServedToday: 23
 *                 averageWaitTime: "8.4"
 *               data:
 *                 - _id: "670b1d3e4c72a0f1b25a9a80"
 *                   name: "Queue 1"
 *                   totalCustomers: 10
 *                   waiting: 4
 *                   servedToday: 6
 *                   averageWaitTime: 7
 *                   customers:
 *                     - id: "670b1d3e4c72a0f1b25a9a81"
 *                       fullName: "John Doe"
 *                       serviceNeeded: "accountOpening"
 *                       queueNumber: "kQ-123ABC"
 *                       joinedAt: "2025-11-06T09:32:12.000Z"
 *                       phone: "08123456789"
 *                       status: "waiting"
 *                     - id: "670b1d3e4c72a0f1b25a9a82"
 *                       fullName: "Mary Johnson"
 *                       serviceNeeded: "loanCollection"
 *                       queueNumber: "kQ-456DEF"
 *                       joinedAt: "2025-11-06T09:40:45.000Z"
 *                       phone: "09087654321"
 *                       status: "done"
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Business not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Error fetching queue management data"
 *               error: "Server error details"
 */

router.get("/queues/:id", getAllQueues);

/**
 * @swagger
 * /api/v1/alert/{id}:
 *   post:
 *     summary: Alert a customer that it’s their turn in the queue
 *     description: Sends an email notification to a specific customer identified by their ID, informing them that it’s their turn to be attended to.
 *     tags:
 *       - Queue Management
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer to alert
 *         schema:
 *           type: string
 *           example: 672cbdb9286f3a54e1d445a7
 *     responses:
 *       200:
 *         description: Customer alerted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer alerted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Johnson Annie
 *                     email:
 *                       type: string
 *                       example: johnsonfavour153@gmail.com
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found in queue
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error alerting customer
 *                 error:
 *                   type: string
 *                   example: Cannot access property of undefined
 */

router.post("/alert/:id", alertCustomer);

/**
 * @swagger
 * /api/v1/skip/{id}:
 *   post:
 *     summary: Skip a customer in the queue
 *     description: Marks a customer's queue status as 'skipped' based on their unique ID.
 *     tags:
 *       - Queue Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the customer to skip.
 *         schema:
 *           type: string
 *           example: 6737a8f2abf1a021cd456ef0
 *     responses:
 *       200:
 *         description: Customer skipped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer skipped
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6737a8f2abf1a021cd456ef0
 *                     status:
 *                       type: string
 *                       example: skipped
 *                     formDetails:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           example: John Doe
 *                         serviceNeeded:
 *                           type: string
 *                           example: Account opening
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error skipping customer
 *                 error:
 *                   type: string
 *                   example: Cannot read properties of null
 */

router.post("/skip/:id", skipCustomer)

/**
 * @swagger
 * /api/v1/remove/{id}:
 *   delete:
 *     summary: Remove a customer from the queue
 *     description: Permanently deletes a customer from the admin queue management system by their unique ID.
 *     tags:
 *       - Queue Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the customer to be removed.
 *         schema:
 *           type: string
 *           example: "670bda72427c143018415849"
 *     responses:
 *       200:
 *         description: Customer removed successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Customer removed successfully"
 *               data:
 *                 _id: "670bda72427c143018415849"
 *                 formDetails:
 *                   fullName: "Johnson Annie"
 *                   email: "johnsonfavour153@gmail.com"
 *                   phone: "09125772521"
 *                   serviceNeeded: "other"
 *                   additionalInfo: "Buss down braids"
 *                   priorityStatus: "pregnantWoman"
 *                 queueNumber: "Q-4156OPK"
 *                 status: "waiting"
 *                 joinedAt: "2025-11-05T23:14:58.416Z"
 *       404:
 *         description: Customer not found or already removed.
 *         content:
 *           application/json:
 *             example:
 *               message: "Customer not found or already removed"
 *       500:
 *         description: Server error while removing customer.
 *         content:
 *           application/json:
 *             example:
 *               message: "Error removing customer"
 *               error: "Internal server error"
 */

router.delete("/remove/:id", removeCustomer);


module.exports = router