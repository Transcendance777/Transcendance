import prisma from '../../init/initPrisma.js';
import { getGameById } from '../../services/igdb.js';

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

export {
	parsePlatformFilter,
	gameMatchesPlatform,
	extractAvailablePlatforms,
	ensureGamePlatforms,
};
