const express = require('express');
const router = express.Router();
const { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, 
    getElderlyCustomers, getPregnantCustomers, getByEmergencyLevel,
    createCustomerQueue,
    } = require('../controllers/customerController');
const {authenticate} = require("../middleware/authenticate");
const { customerFormValidator } = require('../middleware/validation');

// router.post('/customer', createCustomer);

/**
 * @swagger
 * /api/v1/get-all-customers:
 *   get:
 *     tags:
 *       - Customers
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
 * /api/v1/create-queue/{id}:
 *   post:
 *     tags:
 *       - Customers
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
 *                     example: "regularStandard"
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

router.post("/create-queue/:id",customerFormValidator,createCustomerQueue )

/**
 * @swagger
 * /api/v1/get-customer/{id}:
 *   get:
 *     tags:
 *       - Customers
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
 *       - Customers
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
 *   get:
 *     summary: Delete (cancel) a customer from the queue
 *     description: >
 *       Marks a customer as **canceled** inside the queue.  
 *       The authenticated business (organization or branch) must own the customer.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Customer ID to delete
 *         schema:
 *           type: string
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
 *                   example: Customer deleted successfully
 *
 *       404:
 *         description: Business or customer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Customer not found in queue
 *
 *       500:
 *         description: Server error while deleting customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting customers
 */

router.get('/delete-customer/:id', authenticate,  deleteCustomer);

/**
 * @swagger
 * /api/v1/filter/elderly:
 *   get:
 *     tags:
 *       - Customers
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
 *       - Customers
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
 *       - Customers
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
