const express = require('express');
const router = express.Router();
const {getOrganizationSettings, updateOrganization, deleteOrganization,
        getBranchesByOrganization, getAllBranches, getBranchById,
        getAllBranchManagers,getSecuritySettings, updateSecuritySettings,addCardMethod, updateCardMethod,
        getBillingHistory } = require('../controllers/superAdminOrgSettings');

const { authenticate, adminAuth } = require('../middleware/authenticate');

/**
 * @swagger
 * /api/v1/superadmin/settings:
 *   get:
 *     tags:
 *       - Super Admin Organization Management
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
 *       - Super Admin Organization Management
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
 * /api/v1/deleteorganization/{id}:
 *   delete:
 *     tags:
 *       - Super Admin Organization Management
 *     summary: Delete an organization
 *     description: Delete an organization and all its associated branches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID to delete
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
 *                   example: Organization and its branches deleted successfully
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Error deleting organization
 */
router.delete('/deleteorganization/:id', authenticate, deleteOrganization);

/**
 * @swagger
 * /api/v1/getbybranch/{id}:
 *   get:
 *     tags:
 *       - Super Admin Branch Management
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
 *       - Super Admin Branch Management
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
 *       - Super Admin Branch Management
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
 *       - Super Admin Branch Management
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
 * /api/v1/security/{Id}:
 *   get:
 *     tags:
 *       - Super Admin Security Management
 *     summary: Get organization security settings
 *     description: Retrieve security settings for a specific organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Security settings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 securitySettings:
 *                   type: object
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Error fetching security settings
 */
router.get('/security/:Id', authenticate, getSecuritySettings);

/**
 * @swagger
 * /api/v1/security/{Id}:
 *   put:
 *     tags:
 *       - Super Admin Security Management
 *     summary: Update organization security settings
 *     description: Update security settings for a specific organization
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
 *               twoFactorAuth:
 *                 type: boolean
 *               loginNotifications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Security settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 securitySettings:
 *                   type: object
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Error updating security settings
 */
router.put('/security/:Id', authenticate, updateSecuritySettings);

/**
 * @swagger
 * /api/v1/billing/{Id}/cards:
 *   post:
 *     tags:
 *       - Super Admin Billing Management
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
 *       - Super Admin Billing Management
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
 * /api/v1/billing/{Id}/history:
 *   get:
 *     tags:
 *       - Super Admin Billing Management
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

module.exports = router;
