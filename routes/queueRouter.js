const express = require("express");
const router = express.Router();
const { getQueueStats } = require("../controllers/queueController");

router.get("/queue/:branchId", getQueueStats);

module.exports = router;
