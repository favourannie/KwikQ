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
 *     summary: Add a customer to a queue
 *     description: >
 *       This endpoint adds a new customer to a business queue (organization or branch) and automatically assigns them
 *       to one of three queue points (`Queue 1`, `Queue 2`, `Queue 3`) in a round-robin manner.  
 *       If fewer than three queue points exist, the system automatically creates them.  
 *       Each customer also receives a unique randomized queue number.
 *     tags:
 *       - Queue Management
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the business (organization or branch).
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formDetails:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - phone
 *                   - serviceNeeded
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: johndoe@example.com
 *                   phone:
 *                     type: string
 *                     example: "+2348123456789"
 *                   serviceNeeded:
 *                     type: string
 *                     description: >
 *                       Service required by the customer.  
 *                       If it doesn't match any predefined service, it defaults to "other".
 *                     enum:
 *                       - accountOpening
 *                       - loanCollection
 *                       - cardCollection
 *                       - fundTransfer
 *                       - accountUpdate
 *                       - generalInquiry
 *                       - complaintResolution
 *                       - other
 *                     example: fundTransfer
 *                   additionalInfo:
 *                     type: string
 *                     example: "Requesting quick assistance for large transaction"
 *                   priorityStatus:
 *                     type: boolean
 *                     example: false
 *     responses:
 *       201:
 *         description: Customer successfully added to a queue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer added to Queue 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     queueNumber:
 *                       type: string
 *                       example: Q-842XYZ1
 *                     queuePoint:
 *                       type: string
 *                       example: Queue 2
 *                     serviceNeeded:
 *                       type: string
 *                       example: fundTransfer
 *       400:
 *         description: Invalid business role or missing data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid business role. Must be 'multi' or 'individual'.
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
 *                   example: Error assigning customer to queue
 *                 error:
 *                   type: string
 *                   example: Cannot read properties of undefined (reading 'id')
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
 *   delete:
 *     summary: Delete a customer from a business queue
 *     description: Deletes a specific customer from an organization or branch queue. Requires authentication.
 *     tags:
 *       - Queue Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the customer to delete
 *         schema:
 *           type: string
 *           example: 6733b9f148d1a22c86b5f22b
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer deleted successfully from queue
 *                 data:
 *                   type: object
 *                   properties:
 *                     queueNumber:
 *                       type: string
 *                       example: kQ-555DOU0
 *                     customerName:
 *                       type: string
 *                       example: John Doe
 *                     service:
 *                       type: string
 *                       example: loanCollection
 *                     status:
 *                       type: string
 *                       example: waiting
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 *       404:
 *         description: Customer or business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found in this business queue
 *       500:
 *         description: Server error while deleting customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting customer from queue
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.delete('/delete-customer/:id', authenticate,  deleteCustomer);

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
