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

const buildGenreDistribution = (games) => {
	const counts = {};

	for (const game of games) {
		const genres = parseGenres(game.genre);

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

export {
	parseGenreFilter,
	gameMatchesGenre,
	extractAvailableGenres,
	buildGenreDistribution,
};
