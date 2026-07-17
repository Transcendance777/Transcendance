import axios from 'axios';
import 'dotenv/config';
import prisma from '../src/init/initPrisma.js'
import { vaultSecrets } from '../src/init/initVault.js'; //secrets Vault

/**
 * Authentification Twitch / IGDB
 */
async function connectToIGDB(clientId, clientSecret) {
	if (!clientId || !clientSecret) {
		throw new Error("Les variables TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET sont requises.");
	}
	const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
	const authResponse = await axios.post(authUrl);
	const accessToken = authResponse.data.access_token;
	console.log("🔑 [SEED] Jeton d'accès Twitch obtenu.");
	return accessToken;
}

/**
 * Récupération des jeux depuis IGDB
 */
async function getGames(clientId, accessToken) {
	const igdbUrl = 'https://api.igdb.com/v4/games';
	const fields = `fields name, summary, cover.url, genres.name, themes.name, game_modes.name, platforms.name, first_release_date, rating, rating_count, involved_companies.company.name, involved_companies.developer;`;
	const headers = { 'Client-ID': clientId, 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'text/plain' };
	const now = Math.floor(Date.now() / 1000);
	const sixMonthsLater = now + (180 * 24 * 60 * 60);

	const topRatedQuery = `
		${fields}
		where rating_count > 50 & cover != null & summary != null & parent_game = null;
		sort rating desc;
		limit 350;
	`;
	const recentQuery = `
		${fields}
		where first_release_date <= ${now} & first_release_date != null & cover != null & summary != null & parent_game = null & rating_count > 5;
		sort first_release_date desc;
		limit 100;
	`;
	const comingSoonQuery = `
		${fields}
		where first_release_date > ${now} & first_release_date <= ${sixMonthsLater} & cover != null & parent_game = null;
		sort first_release_date asc;
		limit 50;
	`;

	const [topRes, recentRes, soonRes] = await Promise.all([
		axios.post(igdbUrl, topRatedQuery, { headers }),
		axios.post(igdbUrl, recentQuery, { headers }),
		axios.post(igdbUrl, comingSoonQuery, { headers }),
	]);

	const combined = [...topRes.data, ...recentRes.data, ...soonRes.data];
	const unique = Array.from(new Map(combined.map(g => [g.id, g])).values());
	console.log(`🎮 [SEED] ${unique.length} jeux récupérés depuis IGDB. Insertion dans PostgreSQL...`);
	return unique;
}

/**
 * Insertion des jeux dans PostgreSQL avec Prisma
 */
async function insertGames(rawGames) {
	const insertedGames = [];
	for (const game of rawGames) {
		const hdCoverUrl = game.cover?.url
			? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
			: 'https://via.placeholder.com/300x400?text=No+Cover';
		const genresList = game.genres ? game.genres.map(g => g.name).join(', ') : null;
		const themesList = game.themes ? game.themes.map(t => t.name).join(', ') : null;
		const modesList = game.game_modes ? game.game_modes.map(m => m.name).join(', ') : null;
		const platformsList = game.platforms ? game.platforms.map(p => p.name).join(', ') : null;
		const dateDeSortie = game.first_release_date ? new Date(game.first_release_date * 1000) : null;
		const dev = game.involved_companies?.find(c => c.developer)?.company?.name || null;

		const dbGame = await prisma.game.upsert({
			where: { idExterne: game.id.toString() },
			update: {},
			create: {
				idExterne: game.id.toString(),
				title: game.name,
				summary: game.summary,
				coverImageUrl: hdCoverUrl,
				genre: genresList,
				themes: themesList,
				gameModes: modesList,
				platforms: platformsList,
				releaseDate: dateDeSortie,
				developer: dev,
				rating: game.rating || null,
				ratingCount: game.rating_count || null,
			},
		});
		insertedGames.push(dbGame);
	}
	console.log(`✅ [SEED] ${insertedGames.length} jeux synchronisés en base de données.`);
	return insertedGames;
}

/**
 * Main
 */
async function main() {
	console.log("🚀 [SEED] Début du peuplement de la base de données...");

	const clientId = vaultSecrets.TWITCH_CLIENT_ID;
	const clientSecret = vaultSecrets.TWITCH_CLIENT_SECRET;

	const accessToken = await connectToIGDB(clientId, clientSecret);
	const rawGames = await getGames(clientId, accessToken);
	await insertGames(rawGames);

	console.log("✨ [SEED] Base de données PostgreSQL initialisée avec succès !");
}

main()
	.catch((e) => {
		console.error("❌ [SEED] Erreur critique lors du seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});