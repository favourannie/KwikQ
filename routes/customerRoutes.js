const express = require('express');
const router = express.Router();
const {createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, 
    getElderlyCustomers, getPregnantCustomers, getByEmergencyLevel} = require('../controllers/customerQueue');

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
 *                   serviceNeeded:
 *                     type: string
 *                   elderlyStatus:
 *                     type: boolean
 *                   pregnantStatus:
 *                     type: boolean
 *                   emergencyLevel:
 *                     type: string
 *                     enum: [low, medium, high]
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
 *     tags:
 *       - Queue Management
 *     summary: Remove customer from queue
 *     description: Delete a customer from the queue system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.delete('/delete-customer/:id', deleteCustomer);

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
 *     parameters:
 *       - in: path
 *         name: level
 *         required: true
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Emergency level to filter by
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
