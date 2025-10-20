const express = require('express');
const router = express.Router();
const {createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch } = require('../controllers/branchController');
const { authenticate, adminAuth } = require('../middleware/authenticate');


router.post('/create-branch', authenticate, adminAuth, createBranch);


router.get('/branches', getAllBranches);


router.get('/branch/:id', getBranchById);


router.patch('/update-branch/:id', authenticate, adminAuth, updateBranch);


router.delete('/delete-branch/:id', authenticate, adminAuth, deleteBranch);

module.exports = router;
