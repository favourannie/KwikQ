const express = require('express');
const router = express.Router();
const {generateQRCode, getQRCodeInfo, getFormByQrCode, validateQRCodeScan} = require('../controllers/qrCodeController');

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
 *     tags:
 *       - QR Code Management
 *     summary: Generate QR code for a branch
 *     description: |
 *       Generates a unique QR code for a branch. If a QR code already exists for the branch,
 *       returns the existing one instead of creating a new one.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QRCodeRequest'
 *     responses:
 *       201:
 *         description: QR Code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR Code generated successfully
 *                 qrCode:
 *                   type: string
 *                   example: KQ-XYZ789
 *                 formLink:
 *                   type: string
 *                   example: https://qless.app/access/KQ-XYZ789
 *                 qrImage:
 *                   type: string
 *                   description: Base64 encoded QR code image
 *       200:
 *         description: Existing QR Code retrieved
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
 *                 formLink:
 *                   type: string
 *                 qrImage:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization and Branch IDs are required
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
 *                   example: Error generating QR code
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

module.exports = router;
