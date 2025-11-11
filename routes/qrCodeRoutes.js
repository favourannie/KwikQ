const express = require('express');
const router = express.Router();
const {generateQRCode, getQRCodeInfo, getFormByQrCode, validateQRCodeScan, getQueueLength} = require('../controllers/qrCodeController');
const { authenticate, adminAuth } = require('../middleware/authenticate');

/**
 * @swagger
 * components:
 *   schemas:
 *     QRCodeResponse:
 *       type: object
 *       required:
 *         - qrCode
 *         - formLink
 *         - qrImage
 *       properties:
 *         qrCode:
 *           type: string
 *           description: Unique KwikQ code for the branch (e.g., KQ-ABC123)
 *           example: KQ-XYZ789
 *         formLink:
 *           type: string
 *           description: URL to access the queue form
 *           example: https://kwikQ.app/access/KQ-XYZ789
 *         qrImage:
 *           type: string
 *           description: Base64 encoded QR code image
 *           example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...
 *     QRCodeRequest:
 *       type: object
 *       required:
 *         - organizationId
 *         - branchId
 *       properties:
 *         organizationId:
 *           type: string
 *           description: ID of the organization
 *         branchId:
 *           type: string
 *           description: ID of the branch
 *     QueueForm:
 *       type: object
 *       required:
 *         - organization
 *         - branch
 *         - qrCode
 *         - fields
 *       properties:
 *         organization:
 *           type: string
 *           description: Name of the organization
 *         branch:
 *           type: string
 *           description: Name of the branch
 *         qrCode:
 *           type: string
 *           description: The KwikQ code
 *         fields:
 *           type: array
 *           description: Form fields to be displayed
 *           items:
 *             type: string
 *           example: ["fullName", "email", "phone", "serviceNeeded"]
 */

/**
 * @swagger
 * /api/v1/qrcode/generate:
 *   post:
 *     summary: Generate or retrieve a permanent QR code for a business
 *     description: >
 *       This endpoint generates a new permanent QR code for either an **organization** or a **branch**.
 *       If a QR code already exists for the provided `organizationId` or `branchId`, it will return the existing QR code details instead.
 *
 *     tags:
 *       - QR Code Management
 *
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: false
 *         description: The unique ID of the organization. Either `organizationId` or `branchId` must be provided.
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         required: false
 *         description: The unique ID of the branch. Either `organizationId` or `branchId` must be provided.
 *
 *     responses:
 *       200:
 *         description: Existing QR code found and returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Existing permanent QR code retrieved
 *                 qrCode:
 *                   type: string
 *                   example: KQ-123456
 *                 formLink:
 *                   type: string
 *                   example: https://kwik-q.vercel.app/#/queue_form?queue=10&id=653a5...
 *                 qrImageUrl:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v1234567890/qrcodes/branch-123456-KQ-123456.png
 *
 *       201:
 *         description: New QR code generated and uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permanent QR code uploaded successfully to Cloudinary
 *                 qrCode:
 *                   type: string
 *                   example: KQ-654321
 *                 formLink:
 *                   type: string
 *                   example: https://kwik-q.vercel.app/#/queue_form?queue=11&id=653a5...
 *                 qrImageUrl:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v1234567890/qrcodes/branch-654321-KQ-654321.png
 *
 *       400:
 *         description: Bad request due to missing parameters or invalid role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide either organizationId or branchId in the query.
 *
 *       500:
 *         description: Internal server error during QR code generation or upload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error generating or uploading QR code
 *                 error:
 *                   type: string
 *                   example: Something went wrong while uploading to Cloudinary
 */
router.post('/qrcode/generate', generateQRCode);

/**
 * @swagger
 * /api/v1/qrcode/qrinfo/{qrCode}:
 *   get:
 *     tags:
 *       - QR Code Management
 *     summary: Get QR code information
 *     description: |
 *       Retrieves detailed information about a QR code, including associated
 *       organization and branch details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The KwikQ code (e.g., KQ-ABC123)
 *         example: KQ-XYZ789
 *     responses:
 *       200:
 *         description: QR code information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR Code info fetched
 *                 qr:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                     formLink:
 *                       type: string
 *                     qrImage:
 *                       type: string
 *                     organization:
 *                       type: object
 *                       description: Organization details
 *                     branch:
 *                       type: object
 *                       description: Branch details
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: QR code not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR code not found or inactive
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching QR code info
 */
router.get('/qrcode/qrinfo/:qrCode', getQRCodeInfo);

/**
 * @swagger
 * /api/v1/qrcode/form/{qrCode}:
 *   get:
 *     tags:
 *       - QR Code Management
 *     summary: Get queue form for QR code
 *     description: |
 *       Retrieves the queue form configuration and details associated with a QR code.
 *       This endpoint is typically used when a customer scans the QR code.
 *     parameters:
 *       - in: path
 *         name: qrCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The KwikQ code (e.g., KQ-ABC123)
 *         example: KQ-XYZ789
 *     responses:
 *       200:
 *         description: Form details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueueForm'
 *       404:
 *         description: Invalid or expired QR code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired QR code
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching form
 */
router.get('/qrcode/form/:qrCode', getFormByQrCode);

/**
 * @swagger
 * /api/v1/qrcode/validate:
 *   post:
 *     tags:
 *       - QR Code Management
 *     summary: Validate QR code scan
 *     description: |
 *       Validates a QR code scan attempt, checking if the code is active and 
 *       associated with a valid branch and organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCode
 *             properties:
 *               qrCode:
 *                 type: string
 *                 description: The KwikQ code to validate
 *                 example: KQ-XYZ789
 *     responses:
 *       200:
 *         description: QR code validation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR code is valid
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *                 formUrl:
 *                   type: string
 *                   description: URL to the queue form if QR code is valid
 *                   example: https://kwikQ.app/access/KQ-XYZ789
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR code is required
 *       404:
 *         description: QR code not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or inactive QR code
 *                 isValid:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error validating QR code
 *                 isValid:
 *                   type: boolean
 *                   example: false
 */
router.post('/qrcode/validate', validateQRCodeScan);


/**
 * @swagger
 * /api/v1/total-queues:
 *   get:
 *     summary: Get total number of queues
 *     description: Retrieves the total number of queue records currently in the system.
 *     tags:
 *       - Queue
 *     responses:
 *       200:
 *         description: Successfully fetched total number of queues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Total number of queue:"
 *                 data:
 *                   type: integer
 *                   example: 42
 *       500:
 *         description: Error getting queue length
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting queue length"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get("/total-queues", getQueueLength)
module.exports = router;
