import { body } from 'express-validator';

// tableau de fonctions middleware d'express
const createReviewValidation = [
    body('gameId')
      .notEmpty().withMessage('gameId is required')
      .isInt({ min: 1 }).withMessage('gameId must be a positive integer')
      .toInt(),
  
    body('rating')
      .notEmpty().withMessage('rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
      .toInt(),
  
    body('reviewText')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 }).withMessage('Review text must not exceed 2000 characters')
      .escape(), // Échappe les caractères HTML (<, >, &, etc.)
];

// tableau de fonctions middleware d'express
const updateReviewValidation = [
    body('rating')
      .notEmpty().withMessage('rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
      .toInt(),
  
    body('reviewText')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 }).withMessage('Review text must not exceed 2000 characters')
      .escape(), // Échappe les caractères HTML (<, >, &, etc.)
];

export { createReviewValidation , updateReviewValidation };