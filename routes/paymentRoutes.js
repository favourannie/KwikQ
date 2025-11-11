const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  verifyPaymentWebhook,
  getAllPayments
} = require("../controllers/payment");

const { authenticate } = require("../middleware/authenticate");

router.post("/initialize/", authenticate, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", verifyPaymentWebhook);
router.get("/all", getAllPayments);

module.exports = router;