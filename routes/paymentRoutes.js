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
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", verifyPaymentWebhook);
router.get("/all", getAllPayments);

module.exports = router;