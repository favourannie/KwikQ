const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  handleKoraWebhook,
  getAllPayments,
} = require("../controllers/payment");

router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", handleKoraWebhook);
router.get("/all", getAllPayments);

module.exports = router;