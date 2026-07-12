import prisma from '../init/initPrisma.js';

const getYearBounds = (year) => ({
	start: new Date(year, 0, 1),
	end: new Date(year + 1, 0, 1),
});

const buildMonthlyStats = (entries) => {
	const months = Array.from({ length: 12 }, (_, i) => ({
		month: i + 1,
		count: 0,
	}));

	for (const entry of entries) {
		months[entry.addedAt.getMonth()].count++;
	}

	return months;
};

/**
 * ROUTE GET /api/stats/playingList
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getPlayingListStats = async (req, res) => {
	try {
		const userId = Number(req.user.id);
		const year = new Date().getFullYear();
		const { start, end } = getYearBounds(year);

		const entries = await prisma.playingList.findMany({
			where: {
				userId,
				addedAt: {
					gte: start,
					lt: end,
				},
			},
			select: { addedAt: true },
		});

		res.status(200).json({
			year,
			data: buildMonthlyStats(entries),
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

const buildRatingDistribution = (grouped) => {
	const distribution = Array.from({ length: 5 }, (_, i) => ({
		rating: i + 1,
		count: 0,
	}));

	for (const row of grouped) {
		if (row.rating >= 1 && row.rating <= 5) {
			distribution[row.rating - 1].count = row._count.rating;
		}
	}

	return distribution;
};

/**
 * ROUTE GET /api/stats/rating-distribution
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getRatingDistribution = async (req, res) => {
	try {
		const userId = Number(req.user.id);

		const grouped = await prisma.review.groupBy({
			by: ['rating'],
			where: { userId },
			_count: { rating: true },
		});

		res.status(200).json({
			data: buildRatingDistribution(grouped),
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

const buildGenreDistribution = (games) => {
	const counts = {};

	for (const game of games) {
		const genres = game.genre
			? game.genre.split(',').map((g) => g.trim()).filter(Boolean)
			: [];

		if (genres.length === 0) {
			counts.Unknown = (counts.Unknown || 0) + 1;
			continue;
		}

		for (const genre of genres) {
			counts[genre] = (counts[genre] || 0) + 1;
		}
	}

	return Object.entries(counts)
		.map(([genre, count]) => ({ genre, count }))
		.sort((a, b) => b.count - a.count);
};

/**
 * ROUTE GET /api/stats/game-genre-distribution
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getGameGenre = async (req, res) => {
	try {
		const userId = Number(req.user.id);

		const list = await prisma.playingList.findMany({
			where: { userId },
			include: { game: true },
			orderBy: { addedAt: 'desc' },
		});

		const games = list.map((entry) => entry.game);

		res.status(200).json({
			data: buildGenreDistribution(games),
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

export default { getPlayingListStats, getRatingDistribution, getGameGenre };
