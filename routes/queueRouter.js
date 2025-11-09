const express = require("express");
const router = express.Router();
const { getQueueStats } = require("../controllers/queueController");

router.get("/queue/:branchId", getQueueStats);

// router.post('/joinqueue', joinQueue)

module.exports = router;
