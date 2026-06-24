import express from 'express';
const router = express.Router();
import gamesController from '../controllers/gamesControllers.js';
import reviewsController from '../controllers/reviewsController.js';

// Route 1 : Récupérer tous les jeux
router.get('/games', gamesController.getAllGames);

// Route 2 : Récupérer un jeu par ID
router.get('/games/:id', gamesController.getGameById);

// Route 3 : Récupérer des critiques par ID de jeu
router.get('/games/:id/reviews', reviewsController.getReviewsByGame);


export default router;