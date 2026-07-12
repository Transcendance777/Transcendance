import prisma from '../init/initPrisma.js';
import {
	resolveStatsDateRange,
	buildDateFilter,
	buildMonthlyStats,
	parseReleaseYearRange,
	gameMatchesReleaseRange,
} from './utils/statsDateUtils.js';
import {
	parseGenreFilter,
	gameMatchesGenre,
	extractAvailableGenres,
	buildGenreDistribution,
} from './utils/statsGenreUtils.js';
import { buildRatingDistributionFromReviews } from './utils/statsRatingUtils.js';
import {
	parsePlatformFilter,
	gameMatchesPlatform,
	extractAvailablePlatforms,
	ensureGamePlatforms,
} from './utils/statsPlatformUtils.js';
import { generateStatsPdf } from './utils/statsExportUtils.js';

/**
 * ROUTE GET /api/stats/playingList -> line chart of all played games through time
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

/**
 * ROUTE GET /api/stats/rating-distribution -> bar chart of rating distribution
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

/**
 * ROUTE GET /api/stats/game-genre-distribution -> pie chart of all played games by genre
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

/**
 * ROUTE GET /api/stats/export -> button 'export'
 * @param {*} req requete recue
 * @param {*} res reponse renvoyee
 */
const exportStats = async (req, res) => {
	try {
		const userId = Number(req.user.id);
		const username = req.user.username ?? 'User';
		const dateRange = resolveStatsDateRange(req);
		const { period, start, end, year, fromYear, toYear } = dateRange;

		const [playingListEntries, reviews, genreList] = await Promise.all([
			prisma.playingList.findMany({
				where: {
					userId,
					...buildDateFilter('addedAt', start, end),
				},
				include: { game: true },
			}),
			prisma.review.findMany({
				where: {
					userId,
					...buildDateFilter('createdAt', start, end),
				},
			}),
			prisma.playingList.findMany({
				where: {
					userId,
					...buildDateFilter('addedAt', start, end),
				},
				include: { game: true },
			}),
		]);

		const playingListStats = buildMonthlyStats(
			playingListEntries.map((entry) => ({ addedAt: entry.addedAt })),
			start,
			end,
		);
		const ratingDistribution = buildRatingDistributionFromReviews(reviews);
		const genreDistribution = buildGenreDistribution(
			genreList.map((entry) => entry.game),
		);

		generateStatsPdf(res, {
			username,
			period,
			year,
			fromYear,
			toYear,
			playingListStats,
			ratingDistribution,
			genreDistribution,
		});
	} catch (error) {
		if (!res.headersSent) {
			res.status(500).json({ error: 'Server error', details: error.message });
		}
	}
};

export default { getPlayingListStats, getRatingDistribution, getGameGenre, export: exportStats };
