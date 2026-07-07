import express from 'express';
const router = express.Router();
import gamesController from '../controllers/gamesControllers.js';
import reviewsController from '../controllers/reviewsController.js';

/**
 * @swagger
 * /api/public/games:
 *   get:
 *     summary: Get all games
 *     description: Returns a paginated list of games with their id and title. Secured by API key authentication.
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
 *           default: 10
 *         description: Number of games per page
 *     responses:
 *       200:
 *         description: Paginated list of games
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.get('/', gamesController.getAllGames);

/**
 * @swagger
 * /api/public/games/{id}:
 *   get:
 *     summary: Get a game by ID
 *     description: Returns one game by its ID. Secured by API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The game ID
 *     responses:
 *       200:
 *         description: Game found
 *       404:
 *         description: Game not found
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.get('/:id', gamesController.getGameById);

/**
 * @swagger
 * /api/public/games/{id}/reviews:
 *   get:
 *     summary: Get reviews by game ID
 *     description: Returns a paginated list of reviews for a specific game. Secured by API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The game ID
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
 *           default: 10
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Paginated list of reviews for the game
 *       401:
 *         description: Missing or invalid API key
 *       500:
 *         description: Server error
 */
router.get('/:id/reviews', reviewsController.getReviewsByGame);

export default router;