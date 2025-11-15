const express = require('express');
const router = express.Router();
const {generateQRCode, getQRCodeInfo, getFormByQrCode, validateQRCodeScan, getQueueLength} = require('../controllers/qrCodeController');
const { authenticate, adminAuth } = require('../middleware/authenticate');

/**
 * @swagger
 * /api/v1/qrcode/generate:
 *   post:
 *     summary: Generate or retrieve a permanent QR code for an organization or branch
 *     description: >
 *       This endpoint generates a permanent QR code for either an individual organization or a branch.
 *       If a QR code already exists for the business, it returns the existing one instead of creating a new one.
 *       The QR code is uploaded to Cloudinary and linked with the business.
 *     tags:
 *       - QR Code Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               individualId:
 *                 type: string
 *                 description: The ID of the individual or organization (if applicable)
 *                 example: "673b1f5d83c7b7a2f42b3456"
 *               branchId:
 *                 type: string
 *                 description: The ID of the branch (if applicable)
 *                 example: "673b1f9a83c7b7a2f42b7890"
 *     responses:
 *       200:
 *         description: Successfully retrieved an existing permanent QR code
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
 *                   example: https://kwik-q.vercel.app/#/queue_form?queue=4&id=673b1f5d83c7b7a2f42b3456
 *                 qrImageUrl:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v123456/qrcodes/branch-1-KQ-123456.png
 *       201:
 *         description: Successfully generated and uploaded a new permanent QR code
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
 *                   example: KQ-987654
 *                 formLink:
 *                   type: string
 *                   example: https://kwik-q.vercel.app/#/queue_form?queue=5&id=673b1f9a83c7b7a2f42b7890
 *                 qrImageUrl:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v123456/qrcodes/branch-2-KQ-987654.png
 *       400:
 *         description: Invalid input or missing required fields (e.g. no business found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *       500:
 *         description: Server error while generating or uploading the QR code
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
 *                   example: Cannot destructure property 'individualId' of 'req.body' as it is undefined.
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
 * /api/v1/total-queues/{id}:
 *   get:
 *     tags:
 *       - Queue Management
 *     summary: Get total number of customers in a business queue
 *     description: Returns the total number of customers currently in queue for the specified business (organization or branch).
 *     
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Business ID (organizationId or branchId)
 *         schema:
 *           type: string
 *           example: "67a0bcd2988dfe3c12345678"
 *
 *     responses:
 *       200:
 *         description: Successfully fetched total queue length
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched total number of queues
 *                 data:
 *                   type: number
 *                   example: 25
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
 *                   example: Business not found
 *
 *       500:
 *         description: Error getting queue length
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error getting queue length
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

router.get("/total-queues/:id", getQueueLength)
module.exports = router;
