const express = require('express');
const router = express.Router();
const {getOrganizationSettings, createOrganization, updateOrganization, deleteOrganization,
        getBranchesByOrganization, getAllBranches, getBranchById} = require('../controllers/superAdminOrgSettings');

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
 *     Branch:
 *       type: object
 *       required:
 *         - branchName
 *         - city
 *         - state
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the branch
 *           example: "507f1f77bcf86cd799439011"
 *         branchName:
 *           type: string
 *           description: Name of the branch location
 *           example: "Downtown Branch"
 *         city:
 *           type: string
 *           description: City where branch is located
 *           example: "Lagos"
 *         state:
 *           type: string
 *           description: State where branch is located
 *           example: "Lagos State"
 *         manager:
 *           type: string
 *           description: Name of the branch manager
 *           example: "John Doe"
 *     OrganizationSetting:
 *       type: object
 *       required:
 *         - organizationId
 *         - organizationName
 *         - contactEmail
 *       properties:
 *         organizationId:
 *           type: string
 *           description: MongoDB ObjectId of the organization
 *           example: "507f1f77bcf86cd799439012"
 *         organizationName:
 *           type: string
 *           description: Official name of the organization
 *           example: "Global Bank Ltd"
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Primary contact email for the organization
 *           example: "contact@globalbank.com"
 *         contactPhone:
 *           type: string
 *           description: Primary contact phone number
 *           example: "+234 800 123 4567"
 *         website:
 *           type: string
 *           format: uri
 *           description: Organization's website URL
 *           example: "https://www.globalbank.com"
 *         taxId:
 *           type: string
 *           description: Organization's tax identification number
 *           example: "TAX123456789"
 *         headOfficeAddress:
 *           type: string
 *           description: Physical address of the head office
 *           example: "123 Main Street, Victoria Island, Lagos"
 *         industryType:
 *           type: string
 *           description: Type of industry the organization operates in
 *           example: "Banking"
 *         userAndRoles:
 *           type: object
 *           description: User roles and permissions configuration
 *         securitySettings:
 *           type: object
 *           description: Security and access control settings
 *         subscriptionDetails:
 *           type: object
 *           description: Details of the organization's subscription plan
 *           properties:
 *             plan:
 *               type: string
 *               example: "premium"
 *             validUntil:
 *               type: string
 *               format: date-time
 *         maxBranches:
 *           type: integer
 *           description: Maximum number of branches allowed
 *           minimum: 1
 *           example: 50
 *         autoApproval:
 *           type: boolean
 *           description: Whether queue entries are automatically approved
 *           example: true
 *         totalBranches:
 *           type: integer
 *           description: Current number of branches
 *           minimum: 0
 *           example: 25
 *         branches:
 *           type: array
 *           description: List of organization's branches
 *           items:
 *             $ref: '#/components/schemas/Branch'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the organization was created
 *           example: "2025-10-27T10:30:00Z"
 */

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     tags:
 *       - Super Admin Org Settings
 *     summary: Get organization settings
 *     description: |
 *       Fetches comprehensive organization settings for the super-admin dashboard.
 *       Process:
 *       1. Retrieves all organizations with populated branch data
 *       2. Maps organizations to standardized settings format
 *       3. Updates super admin dashboard with latest settings
 *       4. Returns complete organization settings array
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization settings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - organizationSettings
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization settings fetched successfully
 *                 organizationSettings:
 *                   type: array
 *                   description: List of all organization settings
 *                   items:
 *                     $ref: '#/components/schemas/OrganizationSetting'
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
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching organization settings
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.get('/settings',authenticate, adminAuth, getOrganizationSettings);

/**
 * @swagger
 * /api/v1/createorganization:
 *   post:
 *     tags:
 *       - Super Admin Org Settings
 *     summary: Create a new organization
 *     description: |
 *       Creates a new organization and syncs it to the super-admin dashboard.
 *       Process:
 *       1. Creates new Organization document
 *       2. Saves to organization collection
 *       3. Updates SuperAdminDashboard with new organization
 *       4. Returns created organization details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - contactEmail
 *             properties:
 *               organizationName:
 *                 type: string
 *                 description: Official name of the organization
 *                 example: "Global Bank Ltd"
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: Primary contact email
 *                 example: "contact@globalbank.com"
 *               contactPhone:
 *                 type: string
 *                 description: Primary contact number
 *                 example: "+234 800 123 4567"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Organization's website
 *                 example: "https://www.globalbank.com"
 *               taxId:
 *                 type: string
 *                 description: Tax identification number
 *                 example: "TAX123456789"
 *               headOfficeAddress:
 *                 type: string
 *                 description: Physical address of head office
 *                 example: "123 Main Street, Victoria Island, Lagos"
 *               industryType:
 *                 type: string
 *                 description: Industry sector
 *                 example: "Banking"
 *               maxBranches:
 *                 type: integer
 *                 description: Maximum allowed branches
 *                 minimum: 1
 *                 example: 50
 *               autoApproval:
 *                 type: boolean
 *                 description: Auto-approve queue entries
 *                 example: true
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - organization
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization created successfully
 *                 organization:
 *                   $ref: '#/components/schemas/OrganizationSetting'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid organization data
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Not authorized as admin
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating organization
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.post('/createorganization', authenticate, adminAuth, createOrganization);

/**
 * @swagger
 * /api/v1/updateorganization/{id}:
 *   put:
 *     tags:
 *       - Super Admin Org Settings
 *     summary: Update organization details
 *     description: |
 *       Updates an organization's information and re-syncs the super-admin dashboard.
 *       Process:
 *       1. Updates organization using findByIdAndUpdate
 *       2. Re-fetches all organizations
 *       3. Updates SuperAdminDashboard with latest data
 *       4. Returns updated organization details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the organization
 *         example: "507f1f77bcf86cd799439012"
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
 *                 format: email
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
 *               maxBranches:
 *                 type: integer
 *               autoApproval:
 *                 type: boolean
 *           example:
 *             organizationName: "Global Bank Ltd"
 *             contactEmail: "contact@globalbank.com"
 *             maxBranches: 75
 *             autoApproval: true
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - updatedOrganization
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization updated successfully
 *                 updatedOrganization:
 *                   $ref: '#/components/schemas/OrganizationSetting'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating organization
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.put('/updateorganization/:id',authenticate, adminAuth, updateOrganization);

/**
 * @swagger
 * /api/v1/deleteorganization/{id}:
 *   delete:
 *     tags:
 *       - Super Admin Org Settings
 *     summary: Delete organization and all branches
 *     description: |
 *       Removes an organization and all its associated branches.
 *       Process:
 *       1. Verifies organization exists
 *       2. Deletes all branches under the organization
 *       3. Removes the organization itself
 *       4. Re-syncs the super-admin dashboard
 *       
 *       Note: This operation cannot be undone. All branch and queue data will be permanently deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the organization to delete
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Organization and branches successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization and its branches deleted successfully
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting organization
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.delete('/deleteorganization/:id',authenticate, adminAuth, deleteOrganization);

/**
 * @swagger
 * /api/v1/getbybranch/{id}/branches:
 *   get:
 *     tags:
 *       - Super Admin Org Settings
 *     summary: Get organization's branches
 *     description: |
 *       Retrieves all branches belonging to a specific organization.
 *       Features:
 *       - Returns branches with organization details populated
 *       - Includes branch location and management info
 *       - Provides total branch count
 *       - Validates organization existence
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the organization
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Branches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - organizationId
 *                 - totalBranches
 *                 - branches
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branches fetched successfully
 *                 organizationId:
 *                   type: string
 *                   description: MongoDB ObjectId of the organization
 *                   example: "507f1f77bcf86cd799439012"
 *                 totalBranches:
 *                   type: integer
 *                   description: Total number of branches found
 *                   example: 25
 *                 branches:
 *                   type: array
 *                   description: List of branch details
 *                   items:
 *                     $ref: '#/components/schemas/Branch'
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: No branches found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No branches found for this organization
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branches
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.get('/getbybranch/:id/branches',authenticate, adminAuth, getBranchesByOrganization);

/**
 * @swagger
 * /api/v1/branches/all:
 *   get:
 *     tags:
 *       - Super Admin Org Settings
 *     summary: Get all system branches
 *     description: |
 *       Retrieves all branches across all organizations.
 *       Features:
 *       - Optional filtering by organization
 *       - Returns populated organization references
 *       - Includes total branch count
 *       - Supports system-wide branch management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: organization
 *         schema:
 *           type: string
 *         description: Optional MongoDB ObjectId of organization to filter by
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Branches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - totalBranches
 *                 - branches
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branches fetched successfully
 *                 totalBranches:
 *                   type: integer
 *                   description: Total number of branches retrieved
 *                   example: 150
 *                 branches:
 *                   type: array
 *                   description: List of all branches with organization details
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Branch'
 *                       - type: object
 *                         properties:
 *                           organization:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               organizationName:
 *                                 type: string
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Not authorized as admin
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branches
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.get('/branches/all', authenticate, adminAuth,getAllBranches);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     tags:
 *       - Super Admin Org Settings
 *     summary: Get detailed branch information
 *     description: |
 *       Retrieves comprehensive information about a specific branch.
 *       Features:
 *       - Returns full branch details
 *       - Includes populated organization data
 *       - Contains organization contact information
 *       - Supports branch management tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the branch
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Branch details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *                 - branch
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch fetched successfully
 *                 branch:
 *                   type: object
 *                   allOf:
 *                     - $ref: '#/components/schemas/Branch'
 *                     - type: object
 *                       properties:
 *                         organization:
 *                           type: object
 *                           properties:
 *                             organizationName:
 *                               type: string
 *                               example: "Global Bank Ltd"
 *                             contactEmail:
 *                               type: string
 *                               format: email
 *                               example: "contact@globalbank.com"
 *                             contactPhone:
 *                               type: string
 *                               example: "+234 800 123 4567"
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Not authorized as admin
 *       404:
 *         description: Branch not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Branch not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching branch
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.get('/branches/:id',authenticate, adminAuth, getBranchById);

module.exports = router;
