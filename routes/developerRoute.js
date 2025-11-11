// const express = require('express');
// const router = express.Router();
// const { registerDeveloper, devVerify, devLogin, resendOtp   } = require('../controllers/developer');
// const { registerValidator, verifyValidator, resendValidator } = require('../middleware/validation');

// /**
//  * @swagger
//  * /api/v1/developers/register:
//  *   post:
//  *     summary: Register a new developer account
//  *     description: Create a new developer account with name, email, and password.
//  *     tags: [Developers]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - fullName
//  *               - email
//  *               - password
//  *               - confirmPassword
//  *             properties:
//  *               fullName:
//  *                 type: string
//  *                 example: John Doe
//  *               email:
//  *                 type: string
//  *                 example: john@dev.com
//  *               password:
//  *                 type: string
//  *                 example: strongPass123
//  *               confirmPassword:
//  *                 type: string
//  *                 example: strongPass123
//  *     responses:
//  *       201:
//  *         description: Developer account created successfully
//  *       400:
//  *         description: Bad request or validation error
//  *       500:
//  *         description: Server error
//  */
// router.post('/developers/register', registerDeveloper);

// router.post('/verify', devVerify );

// router.post('/resendotp', resendOtp);

// router.post('/login', devLogin );


// module.exports = router;
