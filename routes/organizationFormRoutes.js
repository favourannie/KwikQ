const { createOrganizationForm } = require('../controllers/organizationFormController');
const { organizationFormValidator } = require('../middleware/validation');
const router = require('express').Router();
const { authenticate } = require('../middleware/authenticate');



/**
 * @swagger
 * /api/v1/create-form:
 *   post:
 *     summary: Create an organization form
 *     description: Creates a new organization form record after validating that the business name and email match existing organization data.
 *     tags:
 *       - Organizations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - industryServiceType
 *               - headOfficeAddress
 *               - city
 *               - state
 *               - fullName
 *               - phoneNumber
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 example: "support@techinnovators.com"
 *               industryServiceType:
 *                 type: string
 *                 example: "Technology Services"
 *               headOfficeAddress:
 *                 type: string
 *                 example: "12 Silicon Avenue, Lagos"
 *               city:
 *                 type: string
 *                 example: "Lagos"
 *               state:
 *                 type: string
 *                 example: "Lagos State"
 *               fullName:
 *                 type: string
 *                 example: "Favour Johnson"
 *               phoneNumber:
 *                 type: string
 *                 example: "08012345678"
 *     responses:
 *       200:
 *         description: Organization data saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organization data saved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671a12bcf34a5c001fef2345"
 *                     businessName:
 *                       type: string
 *                       example: "Tech Innovators Ltd"
 *                     industryServiceType:
 *                       type: string
 *                       example: "Technology Services"
 *                     headOfficeAddress:
 *                       type: string
 *                       example: "12 Silicon Avenue, Lagos"
 *                     city:
 *                       type: string
 *                       example: "Lagos"
 *                     state:
 *                       type: string
 *                       example: "Lagos State"
 *                     fullName:
 *                       type: string
 *                       example: "Favour Johnson"
 *                     emailAddress:
 *                       type: string
 *                       example: "support@techinnovators.com"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2348012345678"
 *       400:
 *         description: Bad Request - Missing fields or email mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields are required"
 *       500:
 *         description: Server Error - Business name mismatch or other error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating organization"
 *                 error:
 *                   type: string
 *                   example: "Business name does not match organization name"
 */

router.post("/create-form", authenticate, organizationFormValidator, createOrganizationForm)

module.exports = router