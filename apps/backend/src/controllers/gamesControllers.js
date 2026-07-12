import prisma from '../init/initPrisma.js';


/**
 * ROUTE GET/api/games (get all games)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getAllGames = async (req, res) => {
    try {
        // On récupère les paramètres de pagination depuis l'URL
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit; // Combien d'éléments sauter

		const games = await prisma.game.findMany({
		skip: skip,
		take: limit,
        select: {
            id: true,
            title: true
        }
		});

		// On compte le total pour calculer le nombre de pages
		const total = await prisma.game.count();

		res.status(200).json({
		data: games,
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
 * ROUTE GET/api/games/:id (get games by id)
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getGameById = async (req, res) => {
	try {
		const id = parseInt(req.params.id); // :id est une string, on la convertit

		const game = await prisma.game.findUnique({
			where: { id: id },
		});

		// Si l'ID n'existe pas dans la DB → 404
		if (!game) {
			return res.status(404).json({ error: 'Game not found' });
		}

		res.status(200).json(game);
	}
	catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

export default { getAllGames, getGameById };