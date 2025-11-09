const express = require("express")
const { getBusinessDetails, updateBusinessDetails } = require("../controllers/adminSettingsController"
)
const router = express.Router()
router.get("/business-details/:id", getBusinessDetails)
router.patch("/business/:id", updateBusinessDetails )
module.exports = router