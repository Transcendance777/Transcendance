let accessToken = null;
let tokenExpiry = null;
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

const getAccessToken = async () => {
	if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
		return accessToken;
	}

	const response = await fetch(
		`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
		{ method: 'POST' }
	);

	const data = await response.json();
	accessToken = data.access_token;
	tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
	return accessToken;
};

const igdbQuery = async (endpoint, query) => {
	const cacheKey = `${endpoint}:${query}`;

	if (cache.has(cacheKey)) {
		const { data, timestamp } = cache.get(cacheKey);
		if (Date.now() - timestamp < CACHE_DURATION) {
			return data;
		}
	}

	const token = await getAccessToken();

	const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
		method: 'POST',
		headers: {
			'Client-ID': process.env.TWITCH_CLIENT_ID,
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'text/plain',
		},
		body: query,
	});

	const data = await response.json();
	cache.set(cacheKey, { data, timestamp: Date.now() });
	return data;
};

export const getNewReleases = async () => {
	const now = Math.floor(Date.now() / 1000);
	const threeMonthsAgo = now - (90 * 24 * 60 * 60);

	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, platforms.name, rating, involved_companies.company.name;
    where first_release_date >= ${threeMonthsAgo} & first_release_date <= ${now} & cover != null & rating != null;
    sort first_release_date desc;
    limit 20;
  `);
};

export const getHighlyPraised = async () => {
	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, platforms.name, rating, involved_companies.company.name;
    where rating >= 85 & rating_count >= 20 & cover != null;
    sort rating desc;
    limit 20;
  `);
};

export const getGameById = async (igdbId) => {
	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, platforms.name, rating, rating_count, involved_companies.company.name, screenshots.url, artworks.url;
    where id = ${igdbId};
    limit 1;
  `);
};

export const searchGames = async (query) => {
	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, rating, rating_count;
    search "${query}";
    where cover != null & parent_game = null;
    limit 60;
  `);
};

export const getPopularGames = async () => {
	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, platforms.name, rating, involved_companies.company.name;
    where rating >= 75 & rating_count >= 50 & cover != null;
    sort rating_count desc;
    limit 20;
  `);
};

export const getComingSoon = async () => {
	const now = Math.floor(Date.now() / 1000);
	const sixMonthsLater = now + (180 * 24 * 60 * 60);

	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, platforms.name;
    where first_release_date >= ${now} & first_release_date <= ${sixMonthsLater} & cover != null;
    sort first_release_date asc;
    limit 20;
  `);
};

export const getByGenre = async (genreId) => {
	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, rating, rating_count;
    where genres = (${genreId}) & cover != null & rating != null & rating_count >= 15 & parent_game = null;
    sort rating desc;
    limit 50;
  `);
};

export const getByTheme = async (themeId) => {
	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, rating, rating_count;
    where themes = (${themeId}) & cover != null & rating != null & rating_count >= 15 & parent_game = null;
    sort rating desc;
    limit 50;
  `);
};

export const getByGameMode = async (modeId) => {
	return igdbQuery('games', `
    fields name, cover.url, summary, first_release_date, genres.name, rating, rating_count;
    where game_modes = (${modeId}) & cover != null & rating != null & rating_count >= 15 & parent_game = null;
    sort rating desc;
    limit 50;
  `);
};