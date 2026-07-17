import express from 'express';
import apiKeyControllers from '../controllers/apiKey.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate', authMiddleware, apiKeyControllers.generateApiKey); // Générer
// GET /api/api-key (with or without trailing slash)
router.get('/', authMiddleware, apiKeyControllers.getApiKeyStatus); // Etat clé API
router.get('', authMiddleware, apiKeyControllers.getApiKeyStatus); // Etat clé API (fallback)
router.delete('/revoke', authMiddleware, apiKeyControllers.revokeApiKey);   // Révoquer

export default router;