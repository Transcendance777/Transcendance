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

export default { getPlayingListStats };
