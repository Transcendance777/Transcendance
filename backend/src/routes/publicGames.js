import express from 'express';
const router = express.Router();
import gamesController from '../controllers/gamesControllers.js';
import reviewsController from '../controllers/reviewsController.js';

/**
 * @swagger
 * /api/public/games:
 *  get:
 *      summary: Get all the Games
 *      description: Sends all games. Secured by API key authentication.
 *      security:
 *          - ApiKeyAuth: []
 *      parameters:
 *          - in: query
 *              name: page
 *              schema:
 *                  type: integer
 *                  minimum: 1
 *                  default: 1
 *              description: Page number for pagination
 *          - in: query
 *              name: limit
 *              schema:
 *                  type: integer
 *                  minimum: 1
 *                  default: 10
 *              description: Number of reviews per page
 *      responses:
 *          200:
 *              description: Succes
 *          401:
 *              description: Missing or invalid API key
 *          500:
 *              description: Server error
 */
router.get('/', gamesController.getAllGames);

/**
 * @swagger
 * /api/public/games/{id}:
 *  get:
 *      summary: Get a game by its ID
 *      description: Sends a specific game. Secured by API key authentication.
 *      security:
 *          - ApiKeyAuth: []
 *      parameters:
 *          - in: path
 *      name: id
 *      required: true
 *      schema:
 *          type: integer
 *          description: The game ID
 *      responses:
 *          200:
 *              description: Success
 *          404:
 *              description: Game not found
 *          401:
 *              description: Missing or invalid API key
 *          500:
 *              description: Server error
 */
router.get('/:id', gamesController.getGameById);

/**
 * @swagger
 * /api/public/games/{id}/reviews:
 *  get:
 *      summary: Get reviews by game ID
 *      description: Get all reviews from one specific game.
 *      security:
 *          - ApiKeyAuth: []
 *      parameters:
 *          - in: path
 *      name: id
 *      required: true
 *      schema:
 *          type: string
 *          description: The game ID
 *      responses:
 *          200:
 *              description: Success
 *          404:
 *              description: Game not found
 *          401:
 *              description: Missing or invalid API key
 *          500:
 *              description: Server error
 */
router.get('/:id/reviews', reviewsController.getReviewsByGame);

export default router;