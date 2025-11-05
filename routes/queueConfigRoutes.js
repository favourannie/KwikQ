const express = require("express")
const { getQueueConfig, saveQueueConfig } = require("../controllers/queueConfig")
// const { authenticate } = require("../middleware/authenticate")
 const router = express.Router()

 /**
 * @swagger
 * /api/v1/queue-config/{id}:
 *   patch:
 *     summary: Update or create queue configuration for a business
 *     description: >
 *       Updates (or creates, if not existing) the queue configuration for either  
 *       an individual organization or a branch under a multi-organization.  
 *       Requires numeric inputs for `maxQueueSize` and `avgServiceTime`.
 *     tags:
 *       - Queue Configuration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization or branch to update
 *         schema:
 *           type: string
 *           example: 672c12ab45df901234abcd56
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxQueueSize:
 *                 type: number
 *                 example: 100
 *               avgServiceTime:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Queue configuration successfully updated or created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Config settings updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 672c12ab45df901234abcd56
 *                     individualId:
 *                       type: string
 *                       example: 671a8baf0fc85f1b9a12345c
 *                     branchId:
 *                       type: string
 *                       example: 671a8baf0fc85f1b9a67890c
 *                     maxQueueSize:
 *                       type: number
 *                       example: 100
 *                     avgServiceTime:
 *                       type: number
 *                       example: 15
 *       400:
 *         description: Invalid input or business not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input types, only numbers are allowed.
 *       500:
 *         description: Server error while updating queue configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating config settings
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

 router.patch("/queue-config/:id", saveQueueConfig)

 /**
 * @swagger
 * /api/v1/queue-config/{id}:
 *   get:
 *     summary: Get queue configuration for a specific business
 *     description: Retrieve the queue configuration (max queue size and average service time) for either an individual organization or a branch under a multi-organization.
 *     tags:
 *       - Queue Configuration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organization or branch
 *         schema:
 *           type: string
 *           example: 672c12ab45df901234abcd56
 *     responses:
 *       200:
 *         description: Queue configuration fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Queue configuration fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 672c12ab45df901234abcd56
 *                     maxQueueSize:
 *                       type: integer
 *                       example: 50
 *                     avgServiceTime:
 *                       type: integer
 *                       example: 10
 *       404:
 *         description: No configuration found for this business
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No configuration found for this business
 *       500:
 *         description: Server error while fetching queue configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching queue configuration
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

 router.get("/queue-config/:id", getQueueConfig)
  module.exports = router