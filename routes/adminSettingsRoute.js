const express = require("express")
const { getBusinessDetails, updateBusinessDetails } = require("../controllers/adminSettingsController"
)
const router = express.Router()

/**
 * @swagger
 * /api/v1/business-details/{id}:
 *   get:
 *     summary: Get business or branch details by ID
 *     description: Retrieves detailed information about a business or branch by its unique ID. It supports organization roles of `multi`, `individual`, or `branch`.
 *     tags:
 *       - Business
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the business or branch
 *     responses:
 *       200:
 *         description: Business details fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business details fetched successfully.
 *                 data:
 *                   type: object
 *                   oneOf:
 *                     - description: Multi-branch organization details
 *                       properties:
 *                         businessName:
 *                           type: string
 *                           example: "Techify Group"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+2348101234567"
 *                         businessAddress:
 *                           type: string
 *                           example: "12 Lekki Phase 1, Lagos"
 *                         role:
 *                           type: string
 *                           example: "multi"
 *                         branches:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "64d8c12f9b1234567890abcd"
 *                               branchName:
 *                                 type: string
 *                                 example: "Techify Ikeja Branch"
 *                               branchAddress:
 *                                 type: string
 *                                 example: "Ikeja GRA, Lagos"
 *                     - description: Individual business details
 *                       properties:
 *                         businessName:
 *                           type: string
 *                           example: "SoloTech Solutions"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+2348012345678"
 *                         businessAddress:
 *                           type: string
 *                           example: "5 Admiralty Way, Lekki"
 *                         role:
 *                           type: string
 *                           example: "individual"
 *                     - description: Branch details
 *                       properties:
 *                         businessName:
 *                           type: string
 *                           example: "Techify Ikeja Branch"
 *                         phoneNumber:
 *                           type: string
 *                           example: "+2348087654321"
 *                         businessAddress:
 *                           type: string
 *                           example: "Ikeja GRA, Lagos"
 *                         role:
 *                           type: string
 *                           example: "branch"
 *                         parentOrganization:
 *                           type: string
 *                           example: "Techify Group"
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error getting organization details.
 *                 error:
 *                   type: string
 *                   example: Cast to ObjectId failed for value "xyz" at path "_id"
 */
router.get("/business-details/:id", getBusinessDetails)


/**
 * @swagger
 * /api/v1/business/{id}:
 *   patch:
 *     summary: Update business details
 *     description: Updates an organization's or branch's business details (business name, phone number, and address) based on the provided ID. Works for both `multi` (branch) and `individual` business roles.
 *     tags:
 *       - Business
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the organization or branch
 *         schema:
 *           type: string
 *           example: 6730e5a2a8f43b0012f4c1de
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: TechFlow Solutions
 *               phoneNumber:
 *                 type: string
 *                 example: +2348012345678
 *               businessAddress:
 *                 type: string
 *                 example: 22, Herbert Macaulay Way, Yaba, Lagos
 *             required:
 *               - businessName
 *               - phoneNumber
 *               - businessAddress
 *     responses:
 *       200:
 *         description: Business updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business updated successfully
 *                 data:
 *                   type: object
 *                   example:
 *                     _id: 6730e5a2a8f43b0012f4c1de
 *                     branchId: 6730e5a2a8f43b0012f4c1de
 *                     businessName: TechFlow Solutions
 *                     phoneNumber: +2348012345678
 *                     businessAddress: 22, Herbert Macaulay Way, Yaba, Lagos
 *       404:
 *         description: Business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Business not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating business details.
 *                 error:
 *                   type: string
 *                   example: Cast to ObjectId failed for value...
 */


router.patch("/business/:id", updateBusinessDetails )
module.exports = router