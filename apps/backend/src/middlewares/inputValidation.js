import { body } from 'express-validator';
import { validateInternalRating } from './validationUtils.js';

const validatePublicRating = () =>
	body('rating')
		.notEmpty().withMessage('rating is required')
		.custom((value, { req }) => {
			const result = validateInternalRating(value);
			if (!result.ok) throw new Error(result.error);
			req.body.rating = result.value;
			return true;
		});

// tableau de fonctions middleware d'express
const createReviewValidation = [
    body('gameId')
      .notEmpty().withMessage('gameId is required')
      .isInt({ min: 1 }).withMessage('gameId must be a positive integer')
      .toInt(),
  
    validatePublicRating(),
  
    body('reviewText')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 }).withMessage('Review text must not exceed 2000 characters')
      .escape(), // Échappe les caractères HTML (<, >, &, etc.)
];

// tableau de fonctions middleware d'express
const updateReviewValidation = [
    validatePublicRating(),
  
    body('reviewText')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 2000 }).withMessage('Review text must not exceed 2000 characters')
      .escape(), // Échappe les caractères HTML (<, >, &, etc.)
];

export { createReviewValidation , updateReviewValidation };