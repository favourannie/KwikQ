const express = require('express');
const router = express.Router();
const {getOverview, updateOverview, getOrganizationSettings, updateOrganization, deleteOrganization,
        getBranchesByOrganization, getAllBranches, getBranchById,
        getAllBranchManagers, addCardMethod, updateCardMethod,
        getBillingHistory, removeCard,
        getSettings,downloadInvoice,getInvoices,
        updateSettings, getDashboardMetrics, getFilteredDashboardData,getBranchPerformance,  getServiceDistribution,getBranchAnalytics, getBranchManagement, getBranchByIds, getAllBranchesWithStats,getAllBranch} = require('../controllers/superAdminOverview');
const { authenticate, adminAuth } = require('../middleware/authenticate');


/**
 * @swagger
 * components:
 *   schemas:
 *     Overview:
 *       type: object
 *       required:
 *         - totalOrganizations
 *         - totalBranches
 *         - totalActiveQueues
 *         - totalCustomersServedToday
 *         - lastUpdated
 *       properties:
 *         totalOrganizations:
 *           type: integer
 *           description: Total count of all registered organizations in the system
 *           minimum: 0
 *           example: 25
 *         totalBranches:
 *           type: integer
 *           description: Aggregate count of branches across all organizations
 *           minimum: 0
 *           example: 50
 *         totalActiveQueues:
 *           type: integer
 *           description: Count of queues with 'active' status across all branches
 *           minimum: 0
 *           example: 30
 *         totalCustomersServedToday:
 *           type: integer
 *           description: Cumulative count of customers served since midnight (00:00:00) of the current day
 *           minimum: 0
 *           example: 150
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: ISO 8601 timestamp of when the overview data was last computed
 *           example: "2025-10-27T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/v1/getoverview:
 *   get:
 *     tags:
 *       - Super Admin 
 *     summary: Get real-time dashboard overview
 *     description: |
 *       Retrieves current overview statistics by performing real-time calculations:
 *       - Counts total organizations using Organization model
 *       - Counts total branches using Branch model
 *       - Counts active queues using Queue model
 *       - Aggregates customers served since midnight today
 *       - Updates the SuperAdminDashboard model with latest data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview data calculated and retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - overview
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Overview updated successfully
 *                 overview:
 *                   $ref: '#/components/schemas/Overview'
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
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating overview
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 */
router.get('/getoverview', authenticate, getOverview);

/**
 * @swagger
 * /api/v1/updateoverview:
 *   put:
 *     tags:
 *       - Super Admin 
 *     summary: Manually update dashboard overview
 *     description: |
 *       Manually update the overview statistics in the super admin dashboard.
 *       This endpoint allows for manual overrides of the automatically calculated statistics.
 *       Use cases:
 *       - Correcting discrepancies in statistics
 *       - Testing dashboard displays
 *       - Handling special cases
 *       
 *       Note: Prefer using GET /getoverview for regular updates as it calculates real-time statistics.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - overview
 *             properties:
 *               overview:
 *                 $ref: '#/components/schemas/Overview'
 *           example:
 *             overview:
 *               totalOrganizations: 25
 *               totalBranches: 50
 *               totalActiveQueues: 30
 *               totalCustomersServedToday: 150
 *               lastUpdated: "2025-10-27T10:30:00.000Z"
 *     responses:
 *       200:
 *         description: Overview manually updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - overview
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Overview updated successfully
 *                 overview:
 *                   $ref: '#/components/schemas/Overview'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid overview data provided
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
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating overview
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 */
router.put('/updateoverview', authenticate, updateOverview);


/**
 * @swagger
 * /api/v1/superadmin/settings:
 *   get:
 *     tags:
 *       - Super Admin 
 *     summary: Get all organizations settings
 *     description: Retrieves settings for all organizations including branch information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization settings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization settings fetched successfully
 *                 organizationSettings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       organizationId:
 *                         type: string
 *                       organizationName:
 *                         type: string
 *                       contactEmail:
 *                         type: string
 *                       contactPhone:
 *                         type: string
 *                       website:
 *                         type: string
 *                       taxId:
 *                         type: string
 *                       headOfficeAddress:
 *                         type: string
 *                       industryType:
 *                         type: string
 *       500:
 *         description: Server error while fetching settings
 */
router.get('/settings', authenticate, getOrganizationSettings);

/**
 * @swagger
 * /api/v1/updateorganization/{id}:
 *   put:
 *     tags:
 *       - Super Admin 
 *     summary: Update organization details
 *     description: Update an organization's information and re-sync dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               website:
 *                 type: string
 *               taxId:
 *                 type: string
 *               headOfficeAddress:
 *                 type: string
 *               industryType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization updated successfully
 *                 updatedOrganization:
 *                   type: object
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Error updating organization
 */
router.put('/updateorganization/:id', authenticate, updateOrganization);


/**
 * @swagger
 * /api/settings/delete:
 *   delete:
 *     summary: Delete organization
 *     tags: 
 *       - Super Admin 
 *     description: Permanently delete the organization and all related data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationId:
 *                 type: string
 *                 example: 6730a3e7f9d2b224a9fabb45
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization deleted successfully
 *       500:
 *         description: Error deleting organization
 */
router.delete('/deleteorganization/:id', authenticate, deleteOrganization);

/**
 * @swagger
 * /api/v1/getbybranch/{id}:
 *   get:
 *     tags:
 *       - Super Admin 
 *     summary: Get branches by organization
 *     description: Retrieve all branches for a specific organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Branches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 organizationId:
 *                   type: string
 *                 totalBranches:
 *                   type: number
 *                 branches:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No branches found for this organization
 *       500:
 *         description: Error fetching branches
 */
router.get('/getbybranch/:id', authenticate, getBranchesByOrganization);

/**
 * @swagger
 * /api/v1/branches/all:
 *   get:
 *     tags:
 *       - Super Admin 
 *     summary: Get all branches
 *     description: Retrieve all branches across all organizations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Optional organization ID to filter branches
 *     responses:
 *       200:
 *         description: Branches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalBranches:
 *                   type: number
 *                 branches:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Error fetching branches
 */
router.get('/branches/all', authenticate, getAllBranches);

/**
 * @swagger
 * /api/v1/branch/{id}:
 *   get:
 *     tags:
 *       - Super Admin 
 *     summary: Get branch by ID
 *     description: Retrieve detailed information about a specific branch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 branch:
 *                   type: object
 *                   properties:
 *                     organization:
 *                       type: object
 *       400:
 *         description: Invalid branch ID format
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Error fetching branch
 */
router.get('/branch/:id', authenticate, getBranchById);

/**
 * @swagger
 * /api/v1/roles/managers:
 *   get:
 *     tags:
 *       - Super Admin 
 *     summary: Get all branch managers
 *     description: Retrieve information about all branch managers across organizations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branch managers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalManagers:
 *                   type: number
 *                 managers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       branchId:
 *                         type: string
 *                       branchName:
 *                         type: string
 *                       managerName:
 *                         type: string
 *                       managerEmail:
 *                         type: string
 *                       managerPhone:
 *                         type: string
 *                       organizationName:
 *                         type: string
 *       404:
 *         description: No branches or managers found
 *       500:
 *         description: Error fetching branch managers
 */
router.get('/roles/managers', authenticate, getAllBranchManagers);

/**
 * @swagger
 * /api/v1/updatesetting:
 *   put:
 *     summary: Update organization settings
 *     tags: Super Admin 
 *     description: Update session timeout, login notifications, and audit logging for an organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationSettingsUpdateRequest'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Settings updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/OrganizationSettings'
 *       500:
 *         description: Error updating settings
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganizationSettings:
 *       type: object
 *       properties:
 *         organizationId:
 *           type: string
 *           example: 6730a3e7f9d2b224a9fabb45
 *         sessionTimeout:
 *           type: integer
 *           example: 30
 *           description: Session timeout in minutes
 *         loginNotifications:
 *           type: boolean
 *           example: true
 *           description: Whether login notifications are enabled
 *         auditLogging:
 *           type: boolean
 *           example: false
 *           description: Whether audit logging is enabled
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-11-09T10:15:42.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-11-09T10:20:00.000Z
 *
 *     OrganizationSettingsUpdateRequest:
 *       type: object
 *       required:
 *         - organizationId
 *       properties:
 *         organizationId:
 *           type: string
 *           example: 6730a3e7f9d2b224a9fabb45
 *         sessionTimeout:
 *           type: integer
 *           example: 60
 *         loginNotifications:
 *           type: boolean
 *           example: true
 *         auditLogging:
 *           type: boolean
 *           example: true
 */
router.patch('/updatesettings', updateSettings);

/**
 * @swagger
 * /api/v1/billing/{Id}/cards:
 *   post:
 *     tags:
 *       - Super Admin 
 *     summary: Add new card method
 *     description: Add a new payment card for an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardNumber:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *               cardHolderName:
 *                 type: string
 *               cardType:
 *                 type: string
 *               cvv:
 *                 type: number
 *     responses:
 *       201:
 *         description: Card method added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Error adding card method
 */
router.post('/billing/:Id/cards', authenticate, addCardMethod);

/**
 * @swagger
 * /api/v1/billing/{Id}/cards/{cardId}:
 *   put:
 *     tags:
 *       - Super Admin 
 *     summary: Update card method
 *     description: Update an existing payment card for an organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardHolderName:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 card:
 *                   type: object
 *       404:
 *         description: Organization or card not found
 *       500:
 *         description: Error updating card
 */
router.put('/billing/:Id/cards/:cardId', authenticate, updateCardMethod);

/**
 * @swagger
 * /api/v1/card/{cardId}:
 *   delete:
 *     summary: Remove a payment card by ID
 *     tags:
 *       - Super Admin 
 *     parameters:
 *       - in: path
 *         name: cardId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the card to remove
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Card removed successfully
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
router.delete('/card/:cardId', removeCard);


/**
 * @swagger
 * /api/v1/billing/{Id}/history:
 *   get:
 *     tags:
 *       - Super Admin 
 *     summary: Get billing history
 *     description: Retrieve billing history for a specific organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Billing history fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalTransactions:
 *                   type: number
 *                 billingHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No billing history found
 *       500:
 *         description: Error fetching billing history
 */
router.get('/billing/:Id/history', authenticate, getBillingHistory);

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get organization settings
 *     tags:
 *       - Super Admin 
 *     description: Retrieve an organization's security and configuration settings
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Settings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Settings fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/OrganizationSettings'
 *       404:
 *         description: Settings not found
 *       500:
 *         description: Internal server error
 */
router.get('/settings',getSettings);

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: Get all invoices for an organization
 *     tags:
 *       - Super Admin 
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the organization
 *     responses:
 *       200:
 *         description: List of invoices returned
 *       400:
 *         description: Missing organizationId
 *       500:
 *         description: Server error
 */
router.get('/invoices', getInvoices);

/**
 * @swagger
 * /api/v1/invoices/{id}/download:
 *   get:
 *     summary: Download an invoice file
 *     tags:
 *       - Super Admin 
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Download link provided
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.get('/invoices/:id/download', downloadInvoice);  



/**
 * @swagger
 * /api/v1/getanalytics:
 *   get:
 *     summary: Get dashboard analytics metrics
 *     description: |
 *       Fetches overall dashboard metrics for the specified organization, including:
 *       - Total customers for the current week  
 *       - Percentage change compared to last week  
 *       - Average customer wait time  
 *       - Customer flow trends across days of the week  
 *       
 *       If `organizationId` is not provided, data for all organizations is returned.
 *     tags:
 *       - Super Admin 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: false
 *         description: The ID of the organization to filter analytics by. If omitted, includes all organizations.
 *         schema:
 *           type: string
 *         example: 670e23b90082201c89caafb8d
 *     responses:
 *       200:
 *         description: Dashboard analytics metrics fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard metrics fetched successfully
 *                 totalCustomers:
 *                   type: array
 *                   description: List of customers created during the current week.
 *                   items:
 *                     type: object
 *                     example:
 *                       _id: 673b92116f42d2f42b9e9b23
 *                       name: John Doe
 *                       createdAt: 2025-11-09T08:15:42.000Z
 *                 customerChangePercent:
 *                   type: string
 *                   description: Percentage change in customer count compared to last week.
 *                   example: "15.3"
 *                 avgWaitTime:
 *                   type: string
 *                   description: Average customer wait time (in minutes).
 *                   example: "12"
 *                 trends:
 *                   type: array
 *                   description: Customer activity trends throughout the week (Monday–Sunday).
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: Mon
 *                       totalCustomers:
 *                         type: number
 *                         example: 35
 *                       avgWait:
 *                         type: number
 *                         example: 8
 *       400:
 *         description: Invalid organizationId or bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organizationId provided.
 *       500:
 *         description: Server error while fetching dashboard metrics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching dashboard metrics
 *                 error:
 *                   type: string
 *                   example: Cannot read property 'organizationId' of undefined
 */
router.get('/getanalytics',authenticate, getDashboardMetrics);

/**
 * @swagger
 * /api/v1/getfiltered:
 *   get:
 *     summary: Get filtered dashboard data
 *     description: |
 *       Fetches filtered dashboard analytics data based on the provided **organization ID** and **time range**.  
 *       
 *       - The `organizationId` determines which organization’s data to retrieve.  
 *       - The `timeRange` parameter specifies the time period for filtering analytics.  
 *       - If `organizationId` is `"all"`, data for all organizations is returned.
 *       
 *       **Supported time ranges:**
 *       - `today` → Current day  
 *       - `thisWeek` → Current ISO week (Monday–Sunday)  
 *       - `thisMonth` → Current month  
 *       
 *       If no `timeRange` is provided, defaults to `today`.
 *     tags:
 *       - Super Admin 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: false
 *         description: The ID of the organization to filter dashboard data. Use `"all"` for all organizations.
 *         schema:
 *           type: string
 *         example: 670e23b90082201c89caafb8d
 *       - in: query
 *         name: timeRange
 *         required: false
 *         description: The time range to filter dashboard data.
 *         schema:
 *           type: string
 *           enum: [today, thisWeek, thisMonth]
 *         example: thisWeek
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard data fetched successfully
 *                 organizationId:
 *                   type: string
 *                   example: 670e23b90082201c89caafb8d
 *                 timeRange:
 *                   type: string
 *                   example: thisWeek
 *                 totalCustomers:
 *                   type: array
 *                   description: List of customers created within the selected time range.
 *                   items:
 *                     type: object
 *                     example:
 *                       _id: 673b92116f42d2f42b9e9b23
 *                       name: John Doe
 *                       createdAt: 2025-11-09T08:15:42.000Z
 *                 avgWaitTime:
 *                   type: number
 *                   description: Average wait time (in minutes) for served customers.
 *                   example: 12
 *                 trends:
 *                   type: array
 *                   description: Daily customer traffic trend for the selected time range.
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: Mon
 *                       totalCustomers:
 *                         type: number
 *                         example: 45
 *       400:
 *         description: Invalid query parameters provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organizationId or timeRange.
 *       500:
 *         description: Server error while fetching filtered dashboard data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching filtered dashboard data
 *                 error:
 *                   type: string
 *                   example: Cannot read property 'organizationId' of undefined
 */
router.get('/getfiltered',authenticate, getFilteredDashboardData)

/**
 * @swagger
 * /api/v1/getservicedistribution:
 *   get:
 *     summary: Get service distribution
 *     description: Returns distribution of services across an organization or branch, including total counts and percentages.
 *     tags:
 *       - Super Admin 
 *     parameters:
 *       - in: query
 *         name: orgId
 *         required: false
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the organization
 *       - in: query
 *         name: branchId
 *         required: false
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the branch
 *     responses:
 *       200:
 *         description: Service distribution fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalServices:
 *                       type: integer
 *                       example: 150
 *                 distribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceType:
 *                         type: string
 *                         example: "Customer Support"
 *                       count:
 *                         type: integer
 *                         example: 50
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 33.33
 *       400:
 *         description: Invalid query parameter format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organizationId format
 *                 error:
 *                   type: string
 *                   example: Expected a valid MongoDB ObjectId
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch service distribution
 *                 error:
 *                   type: string
 *                   example: Some internal server error message
 */
router.get('/getservicedistribution', getServiceDistribution );

/**
 * @swagger
 * /api/v1/branchperformance:
 *   get:
 *     summary: Get branch performance for an organization
 *     description: Returns performance metrics for all branches under a specific organization, including customer counts, rankings, and chart data.
 *     tags:
 *       - Super Admin 
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the organization
 *     responses:
 *       200:
 *         description: Branch performance data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch performance data fetched successfully
 *                 organizationId:
 *                   type: string
 *                   example: 650c8f2b1234567890abcdef
 *                 totalBranches:
 *                   type: integer
 *                   example: 3
 *                 totalCustomers:
 *                   type: integer
 *                   example: 120
 *                 chartData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       branchName:
 *                         type: string
 *                         example: Main Branch
 *                       customerCount:
 *                         type: integer
 *                         example: 50
 *                 branchRankings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         example: 1
 *                       branchName:
 *                         type: string
 *                         example: Main Branch
 *                       customerCount:
 *                         type: integer
 *                         example: 50
 *                       percentage:
 *                         type: string
 *                         example: 41.7%
 *       400:
 *         description: Missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: organizationId query parameter is required
 *       404:
 *         description: Organization not found or no branches found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No branches found for this organization
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branch performance data
 *                 error:
 *                   type: string
 *                   example: Some internal server error message
 */
router.get("/branchperformance", getBranchPerformance);

/**
 * @swagger
 * /api/v1/branchanalytics:
 *   get:
 *     summary: Fetch branch analytics summary, trends, and hourly distributions
 *     description: |
 *       Returns customer flow statistics, wait time averages, and hourly distribution analytics for a branch or all branches.
 *       Requires authentication. Data range can be set to **today**, **week**, or **month**.
 *     tags: 
 *       - Super Admin 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *           example: all
 *         description: Specify branch ID or `'all'` for all branches.
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           example: today
 *         description: Defines the time range for analytics data.
 *     responses:
 *       201:
 *         description: Branch analytics data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch Analytics Fetched Successfully
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 1790
 *                         change:
 *                           type: string
 *                           example: "+12%"
 *                         comparison:
 *                           type: string
 *                           example: "vs last week"
 *                         trend:
 *                           type: string
 *                           enum: [up, down]
 *                           example: up
 *                     avgWaitTime:
 *                       type: object
 *                       properties:
 *                         time:
 *                           type: integer
 *                           example: 11
 *                         improvement:
 *                           type: string
 *                           example: "-8%"
 *                         label:
 *                           type: string
 *                           example: improvement
 *                         trend:
 *                           type: string
 *                           enum: [up, down]
 *                           example: down
 *                 trends:
 *                   type: object
 *                   description: Weekly customer flow and wait time trends
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
 *                     customers:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [200, 220, 250, 270, 300, 280, 260]
 *                     avgWait:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [12, 11, 10, 9, 10, 11, 12]
 *                 hourly:
 *                   type: object
 *                   description: Hourly customer distribution (0–23 hours)
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["9:00", "10:00", "11:00", "12:00", "13:00"]
 *                     customers:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [15, 40, 60, 55, 50]
 *                 filters:
 *                   type: object
 *                   description: Filter context for the returned data
 *                   properties:
 *                     branch:
 *                       type: string
 *                       example: "All Branches"
 *                     range:
 *                       type: string
 *                       example: "today"
 *                 branches:
 *                   type: array
 *                   description: List of branches available for analytics selection
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "654abc123def456789"
 *                       name:
 *                         type: string
 *                         example: "Main Branch (MB001)"
 *                 meta:
 *                   type: object
 *                   description: Metadata and timestamps for the analytics
 *                   properties:
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-13T08:00:00.000Z"
 *                     range:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-13T00:00:00.000Z"
 *                         end:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-13T23:59:59.000Z"
 *       401:
 *         description: Unauthorized – Missing or invalid organization ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization ID required
 *       500:
 *         description: Server error while fetching analytics
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
 *                   example: Cannot read property 'id' of undefined
 */
router.get('/branchanalytics', authenticate, getBranchAnalytics);



/**
 * @swagger
 * /api/v1/branchoverview:
 *   get:
 *     summary: Get Branch Management Overview
 *     description: >
 *       Fetches an overview of all branches under an organization, including statistics like 
 *       total branches, active queues, average wait time, and served customers for today and yesterday.  
 *       Requires authentication.
 *     tags:
 *       - Super Admin 
 *     security:
 *       - bearerAuth: []  # Requires JWT or access token
 *     responses:
 *       200:
 *         description: Branch management overview successfully fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch Overview Successfully Fetched
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalBranches:
 *                       type: string
 *                       example: "8 +2 this month"
 *                     activeQueues:
 *                       type: string
 *                       example: "15 +25% from yesterday"
 *                     avgWaitTime:
 *                       type: string
 *                       example: "12 min"
 *                     servedToday:
 *                       type: string
 *                       example: "120 +15% from yesterday"
 *                 branches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "671a32b4c53d1b00123abf90"
 *                       branchName:
 *                         type: string
 *                         example: "Victoria Island Branch"
 *                       branchCode:
 *                         type: string
 *                         example: "VIC-001"
 *                       city:
 *                         type: string
 *                         example: "Lagos"
 *                       state:
 *                         type: string
 *                         example: "Lagos State"
 *                       address:
 *                         type: string
 *                         example: "10 Adeola Odeku Street, Victoria Island"
 *                       managerName:
 *                         type: string
 *                         example: "Emeka Obi"
 *                       status:
 *                         type: string
 *                         enum: [Active, Offline]
 *                         example: "Active"
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-13T10:32:00.000Z"
 *                       activeQueue:
 *                         type: integer
 *                         example: 5
 *                       servedToday:
 *                         type: integer
 *                         example: 22
 *                       avgWaitTime:
 *                         type: integer
 *                         example: 10
 *                 meta:
 *                   type: object
 *                   properties:
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-13T07:32:00.000Z"
 *                     organizationId:
 *                       type: string
 *                       example: "6721a8a7b78e4d001245b932"
 *                     activeCount:
 *                       type: integer
 *                       example: 6
 *                     offlineCount:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization ID required
 *       500:
 *         description: Server error while fetching branch overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branch Overview
 *                 error:
 *                   type: string
 *                   example: "TypeError: Cannot read property 'organizationId' of undefined"
 */

router.get('/branchoverview', authenticate, getBranchManagement);

/**
 * paths:
 * /api/branches/{id}:
 *  get:
 *    summary: Get a specific branch by ID
 *    description: >
 *      Retrieves details of a single branch by its ID.  
 *      Accessible only to authenticated admin users of an organization.
 *    tags:
 *      - Super Admin 
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: The unique ID of the branch
 *        schema:
 *          type: string
 *          example: "672fbe908e56a21b845fbc12"
 *    responses:
 *      '200':
 *        description: Branch fetched successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Branch fetched successfully
 *                data:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      example: "672fbe908e56a21b845fbc12"
 *                    branchName:
 *                      type: string
 *                      example: "Ikeja Branch"
 *                    city:
 *                      type: string
 *                      example: "Lagos"
 *                    state:
 *                      type: string
 *                      example: "Lagos State"
 *                    manager:
 *                      type: string
 *                      example: "John Doe"
 *                    branchCode:
 *                      type: string
 *                      example: "BRCH-001"
 *                    organizationId:
 *                      type: object
 *                      properties:
 *                        _id:
 *                          type: string
 *                          example: "672fbd558e56a21b845fbc09"
 *                        organizationName:
 *                          type: string
 *                          example: "Techwave Global Ltd."
 *                        managerName:
 *                          type: string
 *                          example: "Jane Smith"
 *                        managerEmail:
 *                          type: string
 *                          example: "jane@techwave.com"
 *      '401':
 *        description: Unauthorized - Missing or invalid token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Access denied. No token provided or invalid token."
 *      '404':
 *        description: Branch not found or not part of organization
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Branch not found or not part of your organization"
 *      '500':
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                   example: "Error fetching branch"
 *                error:
 *                  type: string
 *                  example: "Database connection failed"
 */
router.get("/branches/:id", authenticate, getBranchByIds);

/**
 * @swagger
 * /api/v1/getallbranch:
 *   get:
 *     summary: Get all branches with analytics and stats
 *     description: Fetch all branches belonging to a specific organization, including analytics or performance statistics if available.
 *     tags:
 *       - Super Admin 
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization whose branches you want to fetch.
 *     responses:
 *       200:
 *         description: Successfully fetched all branches with analytics data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branches with analytics fetched successfully
 *                 branch:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "671a94bf2e87d36ac4dc219c"
 *                       name:
 *                         type: string
 *                         example: "Victoria Island Branch"
 *                       city:
 *                         type: string
 *                         example: "Lagos"
 *                       organizationId:
 *                         type: string
 *                         example: "671a94bf2e87d36ac4dc2177"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-07T12:30:45.000Z"
 *       400:
 *         description: Missing or invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: organizationId is required
 *       500:
 *         description: Internal server error while fetching branches.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branches with stats
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/getallbranch', getAllBranchesWithStats);

/**
 * @swagger
 * /api/v1/getall/{id}:
 *   get:
 *     summary: Retrieve all branches for an organization
 *     description: Fetches all branches associated with a specific organization by its ID.
 *     tags:
 *       - Super Admin 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the organization
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of branches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64f7b2c3e5b9b2f4a8a3d6f0"
 *                   name:
 *                     type: string
 *                     example: "Main Branch"
 *                   address:
 *                     type: string
 *                     example: "123 Main St, City, Country"
 *       500:
 *         description: Failed to fetch branches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch branches"
 *                 error:
 *                   type: string
 *                   example: "Database error"
 */
router.get('/getall', getAllBranch);

module.exports = router;
