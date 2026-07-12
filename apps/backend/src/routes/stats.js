import express from 'express';
import statsControllers from '../controllers/statsControllers.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/playinglist', authMiddleware, statsControllers.getPlayingListStats);

export default router;
