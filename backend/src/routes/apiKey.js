import express from 'express';
import apiKeyControllers from '../controllers/apiKey.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate', authMiddleware, apiKeyControllers.generateApiKey); // Générer
router.delete('/revoke', authMiddleware, apiKeyControllers.revokeApiKey);   // Révoquer

export default router;