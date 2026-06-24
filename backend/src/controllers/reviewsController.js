import prisma from '../init/initPrisma.js';

/**
 * ROUTE 1 : GET/api/reviews (get all the reviews)
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
 * ROUTE 2 : GET/api/reviews/:id (get reviews by id)
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
 * ROUTE 3 : POST /api/reviews (post a review)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const createReview = async (req, res) => {
	try {
		// On extrait les champs envoyés dans le body JSON
		const { reviewText, rating, gameId, userId } = req.body;

		// Validation basique : ces champs sont obligatoires
		if (!rating || !gameId || !userId) {
			return res.status(400).json({ error: 'Missing fields : rating, userId, gameId are required' });
		}

		//checks if user exists
		const parsedId = parseInt(userId);
		const existingUser = await prisma.users.findUnique({ where: { parsedId } });
		if (!existingUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		// checks rights
		if (req.scope !== 'admin' && existingUser.id !== req.user.id) {
			return res.status(403).json({ error: 'Unauthorised action' });
		}

		if (rating < 1 || rating > 5) {
			return res.status(400).json({ error: 'Rate must be between 1 and 5' });
		}

		const newReview = await prisma.review.create({
			data: {
				reviewText,
				rating: parseInt(rating),
				// On connecte les relations via les IDs
				userId: parseInt(userId),
				gameId: parseInt(gameId)
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
 * ROUTE 4 : PUT /api/reviews/:id (modify a review)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const updateReview = async (req, res) => {
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
		
		const updatedReview = await prisma.review.update({
			where: { id: id },
			data: {
			// On ne met à jour que les champs fournis (les autres restent inchangés)
			...(reviewText && { reviewText }),
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
 * ROUTE 5 : DELETE /api/reviews/:id (delete a review)
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

export default { getAllReviews, getReviewById, createReview, updateReview, deleteReview };