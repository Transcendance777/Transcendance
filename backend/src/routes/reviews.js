import express from 'express';
const router = express.Router();
import reviewsController from '../controllers/reviewsController.js';
import { createReviewValidation, updateReviewValidation }from '../middlewares/inputValidation.js';

// Route 1 : Lister toutes les critiques
router.get('/reviews', reviewsController.getAllReviews);

// Route 2 : Récupérer une critique par son ID
router.get('/reviews/:id', reviewsController.getReviewById);

// Route 3 : Créer une nouvelle critique
router.post('/reviews', createReviewValidation, reviewsController.createReview);

// Route 4 : Modifier une critique existante
router.put('/reviews/:id', updateReviewValidation, reviewsController.updateReview);

// Route 5 : Supprimer une critique
router.delete('/reviews/:id', reviewsController.deleteReview);

export default router;