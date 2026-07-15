import express from 'express';
const router = express.Router();
import reviewsController from '../controllers/reviewsController.js';
import { createReviewValidation, updateReviewValidation }from '../middlewares/inputValidation.js';

/**
 * @swagger
 * /api/public/reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Returns a paginated list of reviews, ordered by most recent first. Secured by API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Paginated list of reviews
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.get('/', reviewsController.getAllReviews);

/**
 * @swagger
 * /api/public/reviews/{id}:
 *   get:
 *     summary: Get a review by ID
 *     description: Returns a single review by its ID. Secured by API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The review ID
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Review not found
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.get('/:id', reviewsController.getReviewById);

/**
 * @swagger
 * /api/public/reviews:
 *   post:
 *     summary: Create a new review
 *     description: Creates a review for a game on behalf of the API key owner. Each user can only submit one review per game. Secured by API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - rating
 *             properties:
 *               gameId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the game being reviewed
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               reviewText:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Optional review text (HTML tags are sanitized)
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error or duplicate review for the same game
 *       404:
 *         description: User not found
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.post('/', createReviewValidation, reviewsController.createReview);

/**
 * @swagger
 * /api/public/reviews/{id}:
 *   put:
 *     summary: Update an existing review
 *     description: Updates a review. Only the review owner or an admin-scoped API key can perform this action. Secured by API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Updated rating from 1 to 5
 *               reviewText:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Optional updated review text (HTML tags are sanitized)
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized action (not the review owner or admin)
 *       404:
 *         description: Review not found
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.put('/:id', updateReviewValidation, reviewsController.updateReview);

/**
 * @swagger
 * /api/public/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Deletes a review. Only the review owner or an admin-scoped API key can perform this action. Secured by API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The review ID
 *     responses:
 *       204:
 *         description: Review deleted successfully
 *       403:
 *         description: Unauthorized action
 *       404:
 *         description: Review not found
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.delete('/:id', reviewsController.deleteReview);

export default router;
