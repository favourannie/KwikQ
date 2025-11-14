const express = require('express');
const router = express.Router();
const {createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, 
    getElderlyCustomers, getPregnantCustomers, getByEmergencyLevel,
    createCustomerQueue,
    getQueuePoints} = require('../controllers/customerQueue');
const {authenticate} = require("../middleware/authenticate")
/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - organization
 *         - branch
 *         - formDetails
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated customer ID
 *         organization:
 *           type: string
 *           description: ID of the organization
 *         branch:
 *           type: string
 *           description: ID of the branch
 *         queueNumber:
 *           type: string
 *           description: Auto-generated queue number (format B001)
 *         formDetails:
 *           type: object
 *           required:
 *             - fullName
 *             - serviceNeeded
 *           properties:
 *             fullName:
 *               type: string
 *               description: Customer's full name
 *             serviceNeeded:
 *               type: string
 *               description: Service requested by the customer
 *             elderlyStatus:
 *               type: boolean
 *               description: Whether the customer is elderly
 *             pregnantStatus:
 *               type: boolean
 *               description: Whether the customer is pregnant
 *             emergencyLevel:
 *               type: string
 *               enum: [low, medium, high]
 *               description: Customer's emergency level
 */

/**
 * @swagger
 * /api/v1/customer:
 *   post:
 *     tags:
 *       - Queue Management
 *     summary: Add a new customer to the queue
 *     description: Creates a new customer entry and assigns an auto-generated queue number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organization
 *               - branch
 *               - formDetails
 *             properties:
 *               organization:
 *                 type: string
 *                 description: Organization ID
 *               branch:
 *                 type: string
 *                 description: Branch ID
 *               formDetails:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - serviceNeeded
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string 
 *                   serviceNeeded:
 *                     type: string
 *                   additionalInfo:
 *                     type: String
 *                   elderlyStatus:
 *                     type: boolean
 *                   pregnantStatus:
 *                     type: boolean
 *                   emergencyLevel:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Customer added to queue successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer added to queue successfully
 *                 queueNumber:
 *                   type: string
 *                   example: B001
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Missing required fields or invalid input
 */
router.post('/customer', createCustomer);

/**
 * @swagger
 * /api/v1/get-all-customers:
 *   get:
 *     tags:
 *       - Queue Management
 *     summary: Get all customers in queue
 *     description: Retrieve all customers with organization and branch details
 *     responses:
 *       200:
 *         description: List of all customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customers fetched successfully
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Server error
 */
router.get('/get-all-customers', getAllCustomers);

/**
 * @swagger
 * /api/v1/queue-points/{id}:
 *   get:
 *     summary: Get all queue points for a business (organization or branch)
 *     description: Retrieves all queue points associated with a given business ID (organization or branch). Also returns the total number of customers waiting across all queue points and the individual counts for each queue point.
 *     tags:
 *       - Queue Management
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
 * /api/v1/create-queue/{id}:
 *   post:
 *     tags:
 *       - Queue Management
 *     summary: Create a customer queue entry
 *     description: 
 *       Adds a customer to the appropriate queue point based on business plan limits and auto-distributes them across available queue points.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Business ID (organization or branch)
 *         schema:
 *           type: string
 *           example: "67a0bcf1123abc8899223344"
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - formDetails
 *             properties:
 *               formDetails:
 *                 type: object
 *                 description: Customer details submitted via form
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *                   phone:
 *                     type: string
 *                     example: "08012345678"
 *                   serviceNeeded:
 *                     type: string
 *                     example: "accountOpening"
 *                   additionalInfo:
 *                     type: string
 *                     example: "First time customer"
 *                   priorityStatus:
 *                     type: string
 *                     example: "elderly"
 *
 *     responses:
 *       201:
 *         description: Customer successfully added to queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer added to Queue 1"
 *                 data:
 *                   type: object
 *                   properties:
 *                     queueNumber:
 *                       type: string
 *                       example: "kQ-483ABC1"
 *                     serialNumber:
 *                       type: string
 *                       example: "T-001"
 *                     queuePoint:
 *                       type: string
 *                       example: "Queue 1"
 *                     serviceNeeded:
 *                       type: string
 *                       example: "accountOpening"
 *
 *       400:
 *         description: Missing data or no active plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No active plan found for this business"
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
 *                   example: "Business not found"
 *
 *       500:
 *         description: Server error while assigning customer to a queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error assigning customer to queue"
 *                 error:
 *                   type: string
 *                   example: "Internal server error message"
 */

router.post("/create-queue/:id", createCustomerQueue )
/**
 * @swagger
 * /api/v1/get-customer/{id}:
 *   get:
 *     tags:
 *       - Queue Management
 *     summary: Get customer by ID
 *     description: Retrieve detailed information about a specific customer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
router.get('/get-customer/:id', getCustomerById);

/**
 * @swagger
 * /api/v1/update-customer/{id}:
 *   put:
 *     tags:
 *       - Queue Management
 *     summary: Update customer details
 *     description: Update customer information in the queue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
router.put('/update-customer/:id', updateCustomer);

/**
 * @swagger
 * /api/v1/delete-customer/{id}:
 *   patch:
 *     summary: Soft-delete a customer from the queue
 *     description: Updates a customer's status to "canceled" instead of deleting them from the database.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the customer to update
 *         schema:
 *           type: string
 *           example: "64f5c2e8a1b2c3456789abcd"
 *     responses:
 *       200:
 *         description: Customer status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer status updated to canceled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     queueNumber:
 *                       type: string
 *                       example: "Q1234"
 *                     customerName:
 *                       type: string
 *                       example: "John Doe"
 *                     service:
 *                       type: string
 *                       example: "Account Opening"
 *                     status:
 *                       type: string
 *                       example: "canceled"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Customer or business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer not found in this business queue"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating customer status"
 *                 error:
 *                   type: string
 *                   example: "Some error message"
 */

router.patch('/delete-customer/:id', authenticate,  deleteCustomer);

/**
 * @swagger
 * /api/v1/filter/elderly:
 *   get:
 *     tags:
 *       - Queue Filters
 *     summary: Get elderly customers
 *     description: Retrieve all customers marked with elderly status
 *     responses:
 *       200:
 *         description: List of elderly customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Elderly customers fetched successfully
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Server error
 */
router.get('/filter/elderly', getElderlyCustomers);

/**
 * @swagger
 * /api/v1/filter/pregnant:
 *   get:
 *     tags:
 *       - Queue Filters
 *     summary: Get pregnant customers
 *     description: Retrieve all customers marked with pregnant status
 *     responses:
 *       200:
 *         description: List of pregnant customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Server error
 */
router.get('/filter/pregnant', getPregnantCustomers);

/**
 * @swagger
 * /api/v1/filter/emergency/{level}:
 *   get:
 *     tags:
 *       - Queue Filters
 *     summary: Get customers by emergency level
 *     description: Retrieve all customers with a specific emergency level
 *     responses:
 *       200:
 *         description: List of customers with specified emergency level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid emergency level
 *       500:
 *         description: Server error
 */
router.get('/filter/emergency/:level', getByEmergencyLevel);

module.exports = router;
