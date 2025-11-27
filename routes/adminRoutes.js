const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { getDashboardMetrics, getRecentActivity, getNotifications, getAllQueues, skipCustomer, serveCustomer, alertCustomer, getBusinessDetails, updateBusinessDetails, getOperatingHours, setWorkingDays, getBranchAnalytics, getQueueConfig, saveQueueConfig, getQueuePoints, getQueueHistory } = require("../controllers/adminController");


/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     description: Retrieve dashboard statistics including active customers in queue, served today, and average wait time.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dashboard metrics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     activeInQueue:
 *                       type: integer
 *                       example: 12
 *                       description: Number of customers currently waiting
 *                     servedToday:
 *                       type: integer
 *                       example: 5
 *                       description: Number of customers served today
 *                     avgWaitTime:
 *                       type: integer
 *                       example: 15
 *                       description: Average wait time in minutes
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Business not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting dashboard metrics"
 */

/**
 * Security scheme definition (usually in your swagger options)
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.get("/dashboard", authenticate, getDashboardMetrics);

/**
 * @swagger
 * /api/v1/recent-activity:
 *   get:
 *     summary: Get recent customer activities for the authenticated business
 *     description: Returns the 10 most recent customer activities (e.g., joined queue, being served, served, alerted) for the authenticated organization or branch. Activities are derived from the latest updates to queue customers.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recent activity fetched successfully
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       queueNumber:
 *                         type: string
 *                         example: kQ-555DOU0
 *                       action:
 *                         type: string
 *                         description: The action performed by the customer
 *                         example: Served
 *                         enum: [Served, Joined queue, Being served, Alert sent]
 *                       timeAgo:
 *                         type: string
 *                         description: Relative time since the last update
 *                         example: 5 min ago
 *       401:
 *         description: Unauthorized - Token is missing or invalid
 *       404:
 *         description: Business not found
 *       500:
 *         description: Error fetching recent activity
 */
router.get("/recent-activity", authenticate, getRecentActivity)


/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Fetch queue notifications for a business (branch or individual)
 *     description: >
 *       Automatically detects whether the provided ID belongs to a **branch** or an **individual**.  
 *       Returns notifications of customers who joined the queue, including priority levels.
 *
 *     tags:
 *       - Admin Management
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


/**
 * @swagger
 * /api/v1/queues/{id}:
 *   get:
 *     summary: Get queue management data for a business
 *     description: >
 *       Retrieves all queue points and their associated customers for a specific business (organization or branch).
 *       It also returns key metrics such as total customers, total waiting customers, total served today, and the average wait time.
 *     tags:
 *       - Admin Management
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
 *       - Admin Management
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
 *       - Admin Management
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
 * /api/v1/serve/{id}:
 *   patch:
 *     summary: Serve a customer
 *     description: >
 *       Updates a customer's queue status from **"waiting"** or **"in_service"** to **"completed"** based on their unique ID.
 *       Returns basic customer information and their updated status.
 *     tags:
 *       - Admin Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the customer to serve
 *         schema:
 *           type: string
 *           example: 6730e5a2a8f43b0012f4c1de
 *     responses:
 *       200:
 *         description: Customer served successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer served
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 6730e5a2a8f43b0012f4c1de
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@gmail.com
 *                 served:
 *                   type: string
 *                   example: completed
 *       400:
 *         description: Customer cannot be served
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer cannot be served. 
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
 *         description: Internal server error while serving customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error serving customer
 *                 error:
 *                   type: string
 *                   example: Cast to ObjectId failed for value "abc123"
 */

router.patch("/serve/:id", serveCustomer);


/**
 * @swagger
 * /api/v1/business-details/{id}:
 *   get:
 *     summary: Get business or branch details by ID
 *     description: Retrieves detailed information about a business or branch by its unique ID. It supports organization roles of `multi`, `individual`, or `branch`.
 *     tags:
 *       - Admin Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the business or branch
 *     responses:
 *       200:
 *         description: Business details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business details fetched successfully.
 *                 data:
 *                   type: object
 *                   oneOf:
 *                     - description: Multi-branch organization details
 *                       properties:
 *                         businessName:
 *                           type: string
 *                           example: "Techify Group"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+2348101234567"
 *                         businessAddress:
 *                           type: string
 *                           example: "12 Lekki Phase 1, Lagos"
 *                         role:
 *                           type: string
 *                           example: "multi"
 *                         branches:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "64d8c12f9b1234567890abcd"
 *                               branchName:
 *                                 type: string
 *                                 example: "Techify Ikeja Branch"
 *                               branchAddress:
 *                                 type: string
 *                                 example: "Ikeja GRA, Lagos"
 *                     - description: Individual business details
 *                       properties:
 *                         businessName:
 *                           type: string
 *                           example: "SoloTech Solutions"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+2348012345678"
 *                         businessAddress:
 *                           type: string
 *                           example: "5 Admiralty Way, Lekki"
 *                         role:
 *                           type: string
 *                           example: "individual"
 *                     - description: Branch details
 *                       properties:
 *                         businessName:
 *                           type: string
 *                           example: "Techify Ikeja Branch"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+2348087654321"
 *                         businessAddress:
 *                           type: string
 *                           example: "Ikeja GRA, Lagos"
 *                         role:
 *                           type: string
 *                           example: "branch"
 *                         parentOrganization:
 *                           type: string
 *                           example: "Techify Group"
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
 *                   example: Error getting organization details.
 *                 error:
 *                   type: string
 *                   example: Cast to ObjectId failed for value "xyz" at path "_id"
 */
router.get("/business-details/:id", getBusinessDetails)


/**
 * @swagger
 * /api/v1/business/{id}:
 *   patch:
 *     summary: Update business details
 *     description: Updates an organization's or branch's business details (business name, phone number, and address) based on the provided ID. Works for both `multi` (branch) and `individual` business roles.
 *     tags:
 *       - Admin Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the organization or branch
 *         schema:
 *           type: string
 *           example: 6730e5a2a8f43b0012f4c1de
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: TechFlow Solutions
 *               phoneNumber:
 *                 type: string
 *                 example: +2348012345678
 *               businessAddress:
 *                 type: string
 *                 example: 22, Herbert Macaulay Way, Yaba, Lagos
 *             required:
 *               - businessName
 *               - phoneNumber
 *               - businessAddress
 *     responses:
 *       200:
 *         description: Business updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business updated successfully
 *                 data:
 *                   type: object
 *                   example:
 *                     _id: 6730e5a2a8f43b0012f4c1de
 *                     branchId: 6730e5a2a8f43b0012f4c1de
 *                     businessName: TechFlow Solutions
 *                     phoneNumber: +2348012345678
 *                     businessAddress: 22, Herbert Macaulay Way, Yaba, Lagos
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
 *                   example: Error updating business details.
 *                 error:
 *                   type: string
 *                   example: Cast to ObjectId failed for value...
 */

router.patch("/business/:id", updateBusinessDetails )

/**
 * @swagger
 * /api/v1/operating-hours:
 *   patch:
 *     tags:
 *       - Admin Management
 *     summary: Set or update operating hours and working days
 *     description: >
 *       Allows a business to set its opening and closing times, working days, and timezone.
 *       Updates existing settings if present, or creates new ones.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - openingTime
 *               - closingTime
 *               - workingDays
 *             properties:
 *               openingTime:
 *                 type: string
 *                 example: "09:00"
 *               closingTime:
 *                 type: string
 *                 example: "17:00"
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Mon", "Tue", "Wed", "Thu", "Fri"]
 *               timezone:
 *                 type: string
 *                 example: "Africa/Lagos"
 *     responses:
 *       200:
 *         description: Operating hours updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Operating hours updated successfully"
 *               data:
 *                 _id: "63f1b3a123abc12345678901"
 *                 openingTime: "09:00"
 *                 closingTime: "17:00"
 *                 workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
 *                 timezone: "Africa/Lagos"
 *                 updatedAt: "2025-11-11T23:59:59.000Z"
 *       201:
 *         description: Operating hours created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Operating hours created successfully"
 *               data:
 *                 _id: "63f1b3a123abc12345678901"
 *                 openingTime: "09:00"
 *                 closingTime: "17:00"
 *                 workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
 *                 timezone: "Africa/Lagos"
 *                 createdAt: "2025-11-11T23:59:59.000Z"
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Business not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Error updating business details."
 *               error: "Error details"
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.patch("/operating-hours", authenticate, setWorkingDays);

/**
 * @swagger
 * /api/v1/operating-hours:
 *   get:
 *     summary: Retrieve operating hours for the authenticated business
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operating hours retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Operating hours retrieved successfully"
 *               data:
 *                 openingTime: "08:00"
 *                 closingTime: "17:00"
 *                 workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
 *                 timezone: "Africa/Lagos"
 *                 updatedAt: "2025-11-11T12:00:00.000Z"
 *       404:
 *         description: Business not found or operating hours not set
 *         content:
 *           application/json:
 *             examples:
 *               businessNotFound:
 *                 value: { "message": "Business not found" }
 *               hoursNotSet:
 *                 value: { "message": "Operating hours not set yet" }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Error retrieving operating hours"
 *               error: "Error details"
 */
router.get("/operating-hours", authenticate, getOperatingHours)


/**
 * @swagger
 * /api/v1/analytics/{id}:
 *   get:
 *     summary: Get branch or individual analytics (last 7 days)
 *     description: Fetches analytics for a branch or individual organization for the last 7 days. 
 *                  Returns total customers, average wait time, customer traffic patterns, 
 *                  peak hours, service type distribution, satisfaction rate, and an analytics snapshot.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The organization ID or branch ID
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
 *                       type: number
 *                       example: 1144
 *                     avgWaitTime:
 *                       type: number
 *                       example: 11.9
 *                     weeklyCustomerVolume:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:
 *                             type: string
 *                             example: Mon
 *                           count:
 *                             type: number
 *                             example: 156
 *                     peakHours:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: number
 *                             example: 14
 *                           count:
 *                             type: number
 *                             example: 42
 *                     serviceTypesDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceType:
 *                             type: string
 *                             example: Loan Inquiry
 *                           count:
 *                             type: number
 *                             example: 120
 *                     satisfactionRate:
 *                       type: string
 *                       example: "87.5"
 *                     analytics:
 *                       type: object
 *                       description: Snapshot of the analytics saved to the database
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
 *                   example: Business not found
 *
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
 *                   example: Unexpected server error
 */

router.get('/analytics/:id', authenticate, getBranchAnalytics);



 /**
 * @swagger
 * /api/v1/queue-config/{id}:
 *   patch:
 *     summary: Update or create queue configuration for a business
 *     description: >
 *       Updates (or creates, if not existing) the queue configuration for either  
 *       an individual organization or a branch under a multi-organization.  
 *       Requires numeric inputs for `maxQueueSize` and `avgServiceTime`.
 *     tags:
 *       - Admin Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization or branch to update
 *         schema:
 *           type: string
 *           example: 672c12ab45df901234abcd56
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxQueueSize:
 *                 type: number
 *                 example: 100
 *               avgServiceTime:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Queue configuration successfully updated or created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Config settings updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 672c12ab45df901234abcd56
 *                     individualId:
 *                       type: string
 *                       example: 671a8baf0fc85f1b9a12345c
 *                     branchId:
 *                       type: string
 *                       example: 671a8baf0fc85f1b9a67890c
 *                     maxQueueSize:
 *                       type: number
 *                       example: 100
 *                     avgServiceTime:
 *                       type: number
 *                       example: 15
 *       400:
 *         description: Invalid input or business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input types, only numbers are allowed.
 *       500:
 *         description: Server error while updating queue configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating config settings
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

 router.patch("/queue-config/:id", saveQueueConfig)

 /**
 * @swagger
 * /api/v1/queue-config/{id}:
 *   get:
 *     summary: Get queue configuration for a specific business
 *     description: Retrieve the queue configuration (max queue size and average service time) for either an individual organization or a branch under a multi-organization.
 *     tags:
 *       - Admin Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization or branch
 *         schema:
 *           type: string
 *           example: 672c12ab45df901234abcd56
 *     responses:
 *       200:
 *         description: Queue configuration fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Queue configuration fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 672c12ab45df901234abcd56
 *                     maxQueueSize:
 *                       type: integer
 *                       example: 50
 *                     avgServiceTime:
 *                       type: integer
 *                       example: 10
 *       404:
 *         description: No configuration found for this business
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No configuration found for this business
 *       500:
 *         description: Server error while fetching queue configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching queue configuration
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

 router.get("/queue-config/:id", getQueueConfig)


 /**
  * @swagger
  * /api/v1/queue-points/{id}:
  *   get:
  *     summary: Get all queue points for a business (organization or branch)
  *     description: Retrieves all queue points associated with a given business ID (organization or branch). Also returns the total number of customers waiting across all queue points and the individual counts for each queue point.
  *     tags:
  *       - Admin Management
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *         description: The ID of the organization or branch whose queue points are being retrieved.
  *     responses:
  *       200:
  *         description: Successfully fetched all queue points.
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   example: Queue points fetched successfully
  *                 totalWaiting:
  *                   type: integer
  *                   example: 25
  *                 data:
  *                   type: array
  *                   items:
  *                     type: object
  *                     properties:
  *                       _id:
  *                         type: string
  *                         example: 671a3bf9f3b87e123456789a
  *                       name:
  *                         type: string
  *                         example: Queue 1
  *                       totalCustomers:
  *                         type: integer
  *                         example: 12
  *                       waitingCount:
  *                         type: integer
  *                         example: 5
  *       400:
  *         description: Invalid business role or request.
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   example: Invalid business role
  *       404:
  *         description: Business not found.
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   example: Business not found
  *       500:
  *         description: Internal server error.
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 message:
  *                   type: string
  *                   example: Error fetching queue points
  *                 error:
  *                   type: string
  *                   example: Cannot read properties of null (reading 'customers')
  */
 router.get("/queue-points/:id", getQueuePoints)

 
/**
 * @swagger
 * /api/v1/history/{id}:
 *   get:
 *     summary: Get queue history for an organization or branch
 *     description: >
 *       Fetches the queue history for a given organization or branch.
 *       Returns detailed customer queue data and performance metrics such as:
 *       - Average wait time  
 *       - Completed today  
 *       - Cancelled / No-show count
 *     tags:
 *       - Admin Management
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

module.exports = router;
