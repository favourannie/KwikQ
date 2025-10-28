const express = require('express');
const router = express.Router();
const {getAnalytics, createAnalytics, updateAnalytics, deleteAnalytics } = require('../controllers/superAdminAnalytics');
const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     BranchAnalytics:
 *       type: object
 *       required:
 *         - branchId
 *         - branchName
 *         - city
 *         - queueCount
 *       properties:
 *         branchId:
 *           type: string
 *           description: MongoDB ObjectId of the branch
 *           example: "507f1f77bcf86cd799439011"
 *         branchName:
 *           type: string
 *           description: Official name of the branch location
 *           example: "Downtown Branch"
 *         city:
 *           type: string
 *           description: City where the branch is located
 *           example: "Lagos"
 *         queueCount:
 *           type: integer
 *           description: Total number of queues associated with this branch
 *           minimum: 0
 *           example: 5
 *     OrganizationAnalytics:
 *       type: object
 *       required:
 *         - organizationId
 *         - organizationName
 *         - totalBranches
 *         - totalQueues
 *         - branches
 *       properties:
 *         organizationId:
 *           type: string
 *           description: MongoDB ObjectId of the organization
 *           example: "507f1f77bcf86cd799439012"
 *         organizationName:
 *           type: string
 *           description: Registered name of the organization
 *           example: "Global Bank Ltd"
 *         totalBranches:
 *           type: integer
 *           description: Total number of branches registered under this organization
 *           minimum: 0
 *           example: 10
 *         totalQueues:
 *           type: integer
 *           description: Aggregate count of queues across all branches in this organization
 *           minimum: 0
 *           example: 25
 *         branches:
 *           type: array
 *           description: Detailed analytics for each branch in the organization
 *           items:
 *             $ref: '#/components/schemas/BranchAnalytics'
 *           minItems: 0
 *     AnalyticsSummary:
 *       type: object
 *       required:
 *         - totalOrganizations
 *         - totalBranches
 *         - totalQueues
 *         - organizationAnalytics
 *       properties:
 *         totalOrganizations:
 *           type: integer
 *           description: Total number of registered organizations
 *           example: 5
 *         totalBranches:
 *           type: integer
 *           description: Total number of branches across all organizations
 *           example: 15
 *         totalQueues:
 *           type: integer
 *           description: Total number of queues across all branches
 *           example: 30
 *         organizationAnalytics:
 *           type: array
 *           description: Detailed analytics for each organization
 *           items:
 *             $ref: '#/components/schemas/OrganizationAnalytics'
 */

/**
 * @swagger
 * /api/v1/getanalytics:
 *   get:
 *     tags:
 *       - Super Admin Analytics
 *     summary: Get comprehensive analytics
 *     description: |
 *       Retrieves and calculates real-time analytics across all organizations. The process includes:
 *       1. Fetches all organizations with basic details
 *       2. Retrieves all branches with organization references
 *       3. Gets all queues with branch and organization data
 *       4. Calculates aggregate statistics:
 *          - Total organizations, branches, and queues
 *          - Per-organization metrics
 *          - Per-branch queue counts
 *       5. Updates the dashboard with latest analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics fetched and calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - analytics
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched all analytics successfully.
 *                 analytics:
 *                   $ref: '#/components/schemas/AnalyticsSummary'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       403:
 *         description: Not authorized as admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Admin privileges required
 *       500:
 *         description: Server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching Analytics
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server

 */
router.get('/getanalytics',adminAuth,authenticate, getAnalytics);

/**
 * @swagger
 * /api/v1/createanalytics:
 *   post:
 *     tags:
 *       - Super Admin Analytics
 *     summary: Create analytics entry
 *     description: |
 *       Create a new analytics record in the super admin dashboard.
 *       Features:
 *       - Uses findOneAndUpdate with upsert for atomic operation
 *       - If analytics exists, completely replaces the existing record
 *       - Validates the analytics data structure before saving
 *       - Returns the complete updated dashboard entry
 *       
 *       Note: Consider using GET /getanalytics for real-time calculated analytics instead.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - analytics
 *             properties:
 *               analytics:
 *                 $ref: '#/components/schemas/AnalyticsSummary'
 *           example:
 *             analytics:
 *               totalOrganizations: 15
 *               totalBranches: 45
 *               totalQueues: 120
 *               organizationAnalytics: [
 *                 {
 *                   organizationId: "507f1f77bcf86cd799439012",
 *                   organizationName: "Global Bank Ltd",
 *                   totalBranches: 5,
 *                   totalQueues: 15,
 *                   branches: [
 *                     {
 *                       branchId: "507f1f77bcf86cd799439011",
 *                       branchName: "Downtown Branch",
 *                       city: "Lagos",
 *                       queueCount: 3
 *                     }
 *                   ]
 *                 }
 *               ]
 *     responses:
 *       201:
 *         description: Analytics created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - analytics
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Analytics created successfully.
 *                 analytics:
 *                   $ref: '#/components/schemas/AnalyticsSummary'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating Analytics
 */
router.post('/createanalytics',adminAuth, authenticate, createAnalytics);

/**
 * @swagger
 * /api/v1/updateanalytics:
 *   put:
 *     tags:
 *       - Super Admin Analytics
 *     summary: Update analytics
 *     description: |
 *       Update existing analytics data in the super admin dashboard.
 *       Key features:
 *       - Uses $set operator for atomic updates
 *       - Only modifies specified analytics fields
 *       - Preserves other dashboard data
 *       - Returns the complete updated document
 *       
 *       Use cases:
 *       - Partial updates to analytics
 *       - Manual corrections to statistics
 *       - Synchronizing with external data sources
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - analytics
 *             properties:
 *               analytics:
 *                 $ref: '#/components/schemas/AnalyticsSummary'
 *           example:
 *             analytics:
 *               totalOrganizations: 15
 *               totalBranches: 45
 *               totalQueues: 120
 *               organizationAnalytics: []  # Include organization data as needed
 *     responses:
 *       200:
 *         description: Analytics updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - analytics
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Analytics updated successfully.
 *                 analytics:
 *                   $ref: '#/components/schemas/AnalyticsSummary'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating Analytics
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.put('/updateanalytics',adminAuth, authenticate, updateAnalytics);

/**
 * @swagger
 * /api/v1/deleteanalytics:
 *   delete:
 *     tags:
 *       - Super Admin Analytics
 *     summary: Delete analytics section
 *     description: |
 *       Remove analytics section from the super admin dashboard.
 *       Implementation details:
 *       - Uses MongoDB $unset operator for field removal
 *       - Atomic operation via findOneAndUpdate
 *       - Preserves other dashboard sections
 *       - Returns the updated document
 *       
 *       Use cases:
 *       - Resetting analytics data
 *       - Preparing for fresh analytics collection
 *       - Removing outdated statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics section successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - cleared
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Analytics section cleared successfully.
 *                 cleared:
 *                   type: object
 *                   description: The updated dashboard object with analytics field removed
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Dashboard document ID
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of the update
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting Analytics
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.delete('/deleteanalytics',adminAuth, authenticate, deleteAnalytics);

module.exports = router;
