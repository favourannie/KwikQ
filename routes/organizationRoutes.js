const { login, createOrganization, makeAdmin, resendOtp, getOrganizations, verifyOtp} = require('../controllers/organizationController');
const { authenticate, adminAuth } = require('../middleware/authenticate');

const router = require('express').Router();


router.post('/create', createOrganization);
router.post("/verify", verifyOtp)
router.post("/login", login)
router.post("/resend-otp", resendOtp)
router.get("/organizations", authenticate, getOrganizations)
router.patch('/organizations/:id', authenticate, adminAuth, makeAdmin);

module.exports = router;
