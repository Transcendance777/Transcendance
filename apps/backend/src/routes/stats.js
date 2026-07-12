import express from 'express';
import statsControllers from '../controllers/statsControllers.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/playinglist', authMiddleware, statsControllers.getPlayingListStats);
router.get('/rating-distribution', authMiddleware, statsControllers.getRatingDistribution);
router.get('/game-genre-distribution', authMiddleware, statsControllers.getGameGenre);

export default router;
