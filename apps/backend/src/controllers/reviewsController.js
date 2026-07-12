import prisma from '../init/initPrisma.js';
import { validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

/**
 * ROUTE GET/api/reviews (get all the reviews)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getAllReviews = async (req, res) => {
    try {
        // On récupère les paramètres de pagination depuis l'URL
		// Ex: /api/reviews?page=2&limit=10
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit; // Combien d'éléments sauter

		const reviews = await prisma.review.findMany({
		skip: skip,
		take: limit,
		orderBy: { createdAt: 'desc' }, // Les plus récentes en premier
		});

		// On compte le total pour calculer le nombre de pages
		const total = await prisma.review.count();

		res.status(200).json({
		data: reviews,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
		});
    }
    catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
    }
};

/**
 * ROUTE GET/api/reviews/:gameId (get reviews by game)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getReviewsByGame = async (req, res) => {
    try {
        // On récupère les paramètres de pagination depuis l'URL
		// Ex: /api/reviews?page=2&limit=10
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit; // Combien d'éléments sauter
		const id = parseInt(req.params.id);

		const reviews = await prisma.review.findMany({
		where: { gameId: id },
		skip: skip,
		take: limit,
		orderBy: { createdAt: 'desc' }, // Les plus récentes en premier
		});

		if (!reviews) {
			return res.status(404).json({ error: 'No reviews for this game' });
		}

		// On compte le total pour calculer le nombre de pages
		const total = await prisma.review.count();

		res.status(200).json({
		data: reviews,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
		});
    }
    catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
    }
};

/**
 * ROUTE GET/api/reviews/:id (get reviews by id)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getReviewById = async (req, res) => {
	try {
		const id = parseInt(req.params.id); // :id est une string, on la convertit

		const review = await prisma.review.findUnique({
			where: { id: id },
		});

		// Si l'ID n'existe pas dans la DB → 404
		if (!review) {
			return res.status(404).json({ error: 'Review not found' });
		}

		res.status(200).json(review);
	}
	catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

/**
 * ROUTE POST /api/reviews (post a review)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const createReview = async (req, res) => {
	//checks if validation middleware has caught any errors beforehand
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		// On extrait les champs envoyés dans le body JSON
		const { reviewText, rating, gameId } = req.body;
		const userId = parseInt(req.user.id);

		//checks if user exists
		const existingUser = await prisma.users.findUnique({ where: { id:userId } });
		if (!existingUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		//check if review has already been made
		const alreadyReviewed = await prisma.review.findFirst({
            where: {
                userId: userId,
                gameId: gameId
            }
        });
        if (alreadyReviewed) {
            return res.status(400).json({ 
                error: 'You have already submitted a review for this game. You can update or delete your existing review instead.' 
            });
        }

		// clean review text before inserting
		const safeReviewText = reviewText
		? sanitizeHtml(reviewText, { allowedTags: ['b', 'i', 'em', 'strong'], allowedAttributes: {} })
		: null;

		//insert into DB
		const newReview = await prisma.review.create({
			data: {
				reviewText: safeReviewText,
				rating: rating,
				// On connecte les relations via les IDs
				userId: userId,
				gameId: gameId
			},
		});

		// 201 Created (et non 200) pour indiquer qu'une ressource a été créée
		res.status(201).json(newReview);
	}
	catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

/**
 * ROUTE PUT /api/reviews/:id (modify a review)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const updateReview = async (req, res) => {
	//checks if validation middleware has caught any errors beforehand
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const id = parseInt(req.params.id);
		const { reviewText, rating } = req.body;

		// Vérifier que la review existe avant de tenter la mise à jour
		const existing = await prisma.review.findUnique({ where: { id } });
		if (!existing) {
			return res.status(404).json({ error: 'Review not found' });
		}

		// checks rights
		if (req.scope !== 'admin' && existing.userId !== req.user.id) {
			return res.status(403).json({ error: 'Unauthorised action' });
		}

		// clean review text before inserting
		const safeReviewText = reviewText
		? sanitizeHtml(reviewText, { allowedTags: ['b', 'i', 'em', 'strong'], allowedAttributes: {} })
		: null;
		
		const updatedReview = await prisma.review.update({
			where: { id: id },
			data: {
			// On ne met à jour que les champs fournis (les autres restent inchangés)
			...(reviewText && { safeReviewText }),
			...(rating && { rating }),
			},
		});

		res.status(200).json(updatedReview);
	}
	catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

/**
 * ROUTE DELETE /api/reviews/:id (delete a review)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const deleteReview = async (req, res) => {
	try {
		const id = parseInt(req.params.id);

		const existing = await prisma.review.findUnique({ where: { id } });
		if (!existing) {
			return res.status(404).json({ error: 'Review not found' });
		}

		// checks rights
		if (req.scope !== 'admin' && existing.userId !== req.user.id) {
			return res.status(403).json({ error: 'Unauthorised action' });
		}

		await prisma.review.delete({
			where: { id: id },
		});

		// 204 No Content : succès mais pas de corps de réponse
		res.status(204).send();
	}
	catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

export default { getAllReviews, getReviewsByGame, getReviewById, createReview, updateReview, deleteReview };