import prisma from '../init/initPrisma.js';
import { getGameById } from '../services/igdb.js';

const VALID_PERIODS = new Set(['all', 'year', '6months', 'custom']);

const MIN_STATS_YEAR = 1990;
const MAX_STATS_YEAR = 2100;

const parseYear = (value) => {
	const year = Number(value);
	if (!Number.isInteger(year) || year < MIN_STATS_YEAR || year > MAX_STATS_YEAR) {
		return null;
	}
	return year;
};

const getStatsDateRange = (period) => {
	const now = new Date();

	if (period === 'year') {
		const year = now.getFullYear();
		return {
			start: new Date(year, 0, 1),
			end: new Date(year + 1, 0, 1),
			year,
			fromYear: null,
			toYear: null,
		};
	}

	if (period === '6months') {
		return {
			start: new Date(now.getFullYear(), now.getMonth() - 5, 1),
			end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
			year: null,
			fromYear: null,
			toYear: null,
		};
	}

	return { start: null, end: null, year: null, fromYear: null, toYear: null };
};

const parsePeriod = (req) => {
	const period = req.query.period ?? 'year';
	return VALID_PERIODS.has(period) ? period : 'year';
};

const resolveStatsDateRange = (req) => {
	const fromYear = parseYear(req.query.fromYear);
	const toYear = parseYear(req.query.toYear);

	if (fromYear !== null && toYear !== null) {
		const startYear = Math.min(fromYear, toYear);
		const endYear = Math.max(fromYear, toYear);

		return {
			period: 'custom',
			start: new Date(startYear, 0, 1),
			end: new Date(endYear + 1, 0, 1),
			year: null,
			fromYear: startYear,
			toYear: endYear,
		};
	}

	const period = parsePeriod(req);
	return {
		period,
		...getStatsDateRange(period),
	};
};

const buildDateFilter = (field, start, end) => {
	const filter = {};
	if (start) filter.gte = start;
	if (end) filter.lt = end;
	return Object.keys(filter).length ? { [field]: filter } : {};
};

const buildMonthBuckets = (start, end) => {
	const buckets = [];
	const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
	const limit = new Date(end);

	while (cursor < limit) {
		buckets.push({
			year: cursor.getFullYear(),
			month: cursor.getMonth() + 1,
			count: 0,
		});
		cursor.setMonth(cursor.getMonth() + 1);
	}

	return buckets;
};

const buildMonthlyStats = (entries, start, end) => {
	if (entries.length === 0) {
		return start && end ? buildMonthBuckets(start, end) : [];
	}

	const rangeStart = start ?? new Date(
		Math.min(...entries.map((entry) => entry.addedAt.getTime())),
	);
	const rangeStartMonth = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
	const rangeEnd = end ?? new Date(
		new Date().getFullYear(),
		new Date().getMonth() + 1,
		1,
	);

	const months = buildMonthBuckets(rangeStartMonth, rangeEnd);

	for (const entry of entries) {
		const bucket = months.find(
			({ year, month }) =>
				year === entry.addedAt.getFullYear() &&
				month === entry.addedAt.getMonth() + 1,
		);
		if (bucket) bucket.count++;
	}

	return months;
};

const parsePlatforms = (platforms) =>
	platforms
		? platforms.split(',').map((platform) => platform.trim()).filter(Boolean)
		: [];

const parsePlatformFilter = (req) => {
	const platform = req.query.platform?.trim();
	return platform && platform !== 'all' ? platform : null;
};

const gameMatchesPlatform = (game, platformFilter) => {
	if (!platformFilter) return true;
	return parsePlatforms(game.platforms).some(
		(platform) => platform.toLowerCase() === platformFilter.toLowerCase(),
	);
};

const extractAvailablePlatforms = (games) => {
	const platforms = new Set();

	for (const game of games) {
		for (const platform of parsePlatforms(game.platforms)) {
			platforms.add(platform);
		}
	}

	return [...platforms].sort((a, b) => a.localeCompare(b));
};

const ensureGamePlatforms = async (game) => {
	if (game.platforms) return game;

	try {
		const igdbData = await getGameById(game.idExterne);
		const igdbGame = igdbData?.[0];
		const platforms = igdbGame?.platforms?.map((p) => p.name).join(', ') || null;

		if (!platforms) return game;

		return prisma.game.update({
			where: { id: game.id },
			data: { platforms },
		});
	} catch {
		return game;
	}
};

/**
 * ROUTE GET /api/stats/playingList
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const getPlayingListStats = async (req, res) => {
	try {
		const userId = Number(req.user.id);
		const { period, start, end, year, fromYear, toYear } = resolveStatsDateRange(req);
		const platformFilter = parsePlatformFilter(req);

		const entries = await prisma.playingList.findMany({
			where: {
				userId,
				...buildDateFilter('addedAt', start, end),
			},
			include: { game: true },
		});

		const enrichedEntries = await Promise.all(
			entries.map(async (entry) => ({
				...entry,
				game: await ensureGamePlatforms(entry.game),
			})),
		);

		const availablePlatforms = extractAvailablePlatforms(
			enrichedEntries.map((entry) => entry.game),
		);

		const filteredEntries = enrichedEntries.filter((entry) =>
			gameMatchesPlatform(entry.game, platformFilter),
		);

		res.status(200).json({
			period,
			year,
			fromYear,
			toYear,
			platform: platformFilter ?? 'all',
			availablePlatforms,
			data: buildMonthlyStats(
				filteredEntries.map((entry) => ({ addedAt: entry.addedAt })),
				start,
				end,
			),
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

const parseGenres = (genre) =>
	genre
		? genre.split(',').map((item) => item.trim()).filter(Boolean)
		: [];

const parseGenreFilter = (req) => {
	const genre = req.query.genre?.trim();
	return genre && genre !== 'all' ? genre : null;
};

const gameMatchesGenre = (game, genreFilter) => {
	if (!genreFilter) return true;
	return parseGenres(game.genre).some(
		(genre) => genre.toLowerCase() === genreFilter.toLowerCase(),
	);
};

const extractAvailableGenres = (games) => {
	const genres = new Set();

	for (const game of games) {
		for (const genre of parseGenres(game.genre)) {
			genres.add(genre);
		}
	}

	return [...genres].sort((a, b) => a.localeCompare(b));
};

const parseReleaseYearRange = (req) => {
	const releaseFromYear = parseYear(req.query.releaseFromYear);
	const releaseToYear = parseYear(req.query.releaseToYear);

	if (releaseFromYear === null || releaseToYear === null) {
		return null;
	}

	const startYear = Math.min(releaseFromYear, releaseToYear);
	const endYear = Math.max(releaseFromYear, releaseToYear);

	return {
		start: new Date(startYear, 0, 1),
		end: new Date(endYear + 1, 0, 1),
		releaseFromYear: startYear,
		releaseToYear: endYear,
	};
};

const gameMatchesReleaseRange = (game, releaseRange) => {
	if (!releaseRange) return true;
	if (!game.releaseDate) return false;

	const releaseDate = new Date(game.releaseDate);
	return releaseDate >= releaseRange.start && releaseDate < releaseRange.end;
};

const toStoredRatingIndex = (storedRating) => {
	if (storedRating >= 1 && storedRating <= 10) {
		return storedRating - 1;
	}
	return null;
};

const buildRatingDistributionFromReviews = (reviews) => {
	const distribution = Array.from({ length: 10 }, (_, i) => ({
		rating: (i + 1) / 2,
		count: 0,
	}));

	for (const review of reviews) {
		const index = toStoredRatingIndex(review.rating);
		if (index !== null && index >= 0 && index < 10) {
			distribution[index].count++;
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
		const { period, start, end, fromYear, toYear } = resolveStatsDateRange(req);
		const genreFilter = parseGenreFilter(req);

		const reviews = await prisma.review.findMany({
			where: {
				userId,
				...buildDateFilter('createdAt', start, end),
			},
			include: { game: true },
		});

		const availableGenres = extractAvailableGenres(reviews.map((review) => review.game));
		const filteredReviews = reviews.filter((review) =>
			gameMatchesGenre(review.game, genreFilter),
		);

		res.status(200).json({
			period,
			fromYear,
			toYear,
			genre: genreFilter ?? 'all',
			availableGenres,
			data: buildRatingDistributionFromReviews(filteredReviews),
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
		const { period, start, end, fromYear, toYear } = resolveStatsDateRange(req);
		const releaseRange = parseReleaseYearRange(req);

		const list = await prisma.playingList.findMany({
			where: {
				userId,
				...buildDateFilter('addedAt', start, end),
			},
			include: { game: true },
			orderBy: { addedAt: 'desc' },
		});

		const games = list.map((entry) => entry.game);
		const filteredGames = games.filter((game) =>
			gameMatchesReleaseRange(game, releaseRange),
		);

		res.status(200).json({
			period,
			fromYear,
			toYear,
			releaseFromYear: releaseRange?.releaseFromYear ?? null,
			releaseToYear: releaseRange?.releaseToYear ?? null,
			data: buildGenreDistribution(filteredGames),
		});
	} catch (error) {
		res.status(500).json({ error: 'Server error', details: error.message });
	}
};

export default { getPlayingListStats, getRatingDistribution, getGameGenre };
