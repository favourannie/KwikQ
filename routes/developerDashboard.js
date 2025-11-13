const express = require("express")
const router = express.Router();
const {
  getDashboardOverview, getRecentCustomers,getPendingPayments
} = require('../controllers/developerDashboard')


router.get('/devdashboard', getDashboardOverview);
router.get('/recent-customers', getRecentCustomers);
router.get('/pending-payments', getPendingPayments);

module.exports = router