const express = require("express")
const { getQueueHistory } = require("../controllers/adminHistoryController")
const router = express.Router()

router.get("/history/:id", getQueueHistory )
module.exports = router