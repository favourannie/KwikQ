const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  verifyPaymentWebhook,
  getAllPayments
} = require("../controllers/payment");

const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * /api/v1/initialize:
 *   post:
 *     summary: Initialize a payment for a subscription plan
 *     description: >
 *       This endpoint initializes a payment using the KoraPay API for either an organization
 *       or an individual account. The authenticated user's ID is automatically extracted from
 *       the access token to determine the business initiating the payment.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []  # Requires authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planType
 *               - billingCycle
 *             properties:
 *               individualId:
 *                 type: string
 *                 description: ID of the individual (optional, may be inferred from token)
 *                 example: "64f7b2c3e5b9b2f4a8a3d6f0"
 *               planType:
 *                 type: string
 *                 description: The type of subscription plan.
 *                 enum: [starter, professional, enterprise]
 *                 example: starter
 *               billingCycle:
 *                 type: string
 *                 description: The billing frequency.
 *                 enum: [monthly, annual]
 *                 example: monthly
 *     responses:
 *       201:
 *         description: Payment initialized successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment initialized successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     reference:
 *                       type: string
 *                       example: KWIKQ_1731392891000_512
 *                     url:
 *                       type: string
 *                       example: https://checkout.korapay.com/pay/abc123
 *       400:
 *         description: Invalid request parameters or missing fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: billingCycle is required (monthly or annual)
 *       404:
 *         description: Business not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *       500:
 *         description: Internal server error while initializing payment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error initializing payment
 *                 error:
 *                   type: object
 *                   example: { code: "500", message: "KoraPay API error" }
 */
router.post("/initialize/", authenticate, initializePayment);

/**
 * @swagger
 * /api/payment/verify/{reference}:
 *   get:
 *     summary: Verify a payment transaction
 *     description: |
 *       Verifies a payment using its transaction reference via the **Korapay API**, updates the payment record in the database, and returns the verification result.  
 *       This route requires a valid authentication token.
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []   # ⬅️ Requires JWT authentication
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *           example: TXN123456789
 *         description: Unique transaction reference ID for the payment to be verified.
 *     responses:
 *       200:
 *         description: Payment verification completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment verification completed
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: success
 *                     data:
 *                       type: object
 *                       properties:
 *                         reference:
 *                           type: string
 *                           example: TXN123456789
 *                         amount:
 *                           type: number
 *                           example: 5000
 *                         currency:
 *                           type: string
 *                           example: NGN
 *                         customer:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: John Doe
 *                             email:
 *                               type: string
 *                               example: johndoe@email.com
 *                         channel:
 *                           type: string
 *                           example: card
 *                         paid_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-11-13T14:25:33.000Z"
 *       400:
 *         description: Invalid or missing reference parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reference is required
 *       500:
 *         description: Error verifying payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error verifying payment
 *                 error:
 *                   type: object
 *                   example:
 *                     status: "failed"
 *                     message: "Invalid transaction reference"
 */
router.get("/verify/:reference", authenticate, verifyPayment);
router.post("/webhook", verifyPaymentWebhook);
router.get("/all", getAllPayments);

module.exports = router;