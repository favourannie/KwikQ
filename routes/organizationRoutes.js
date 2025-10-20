const { login, createOrganization, makeAdmin, resendOtp, getOrganizations, verifyOtp, getOrganizationsById, updateOrganization, deleteOrganization, changePassword, forgotPassword, resetPassword} = require('../controllers/organizationController');
const { authenticate, adminAuth } = require('../middleware/authenticate');
const { googleAuth, googleCallback } = require('../middleware/passport');
const { registerValidator, verifyValidator, resendValidator } = require('../middleware/validation');

const router = require('express').Router();


router.post('/create', registerValidator, createOrganization);
router.post("/verify", verifyValidator, verifyOtp)
router.post("/login", login)
router.post("/resend-otp", resendValidator, resendOtp)
router.get("/organizations", authenticate, getOrganizations)
router.patch('/organizations/:id', authenticate, updateOrganization);
router.patch("/organizations/:id/reset-password", resetPassword);
router.patch('/organizations/admin/:id', authenticate, adminAuth, makeAdmin);
router.get("/auth/google", googleAuth )
router.get("/auth/google/callback", googleCallback)
router.get("/organizations/:id", authenticate, getOrganizationsById)
router.delete("/organizations/:id", authenticate, adminAuth, deleteOrganization)
router.put("/change-password", authenticate, resendValidator, changePassword)
router.post("/forgot-password", forgotPassword )
module.exports = router;
