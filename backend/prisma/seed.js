import axios from 'axios';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import prisma from '../src/init/initPrisma.js' //prisma instance
import { raw } from 'express';


/**
 * Authentification Twitch / IGDB
 * @param {*} clientId identifiant twitch
 * @param {*} clientSecret clé d'acces
 * @returns token d'acces
 */
async function connectToIGDB(clientId, clientSecret)
{
	if (!clientId || !clientSecret) {
		throw new Error("Les variables TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET sont requises.");
	}

	//get the access token from twitch with our secret credentials
	const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
	const authResponse = await axios.post(authUrl);
	const accessToken = authResponse.data.access_token;

	console.log("🔑 [SEED] Jeton d'accès Twitch obtenu.");
	return accessToken;
}

/**
 * Récupération des 50 jeux depuis IGDB
 * @param {*} clientId identifiant twitch
 * @param {*} accessToken token d'acces
 * @returns les jeux récupérés depuis IGDB
 */
async function getGames(clientId, accessToken) {
	const igdbUrl = 'https://api.igdb.com/v4/games';
	const fields = `fields name, summary, cover.url, genres.name, themes.name, game_modes.name, first_release_date, rating, rating_count, involved_companies.company.name, involved_companies.developer;`;
	const headers = { 'Client-ID': clientId, 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'text/plain' };

	const now = Math.floor(Date.now() / 1000);
	const sixMonthsLater = now + (180 * 24 * 60 * 60);

	// 1. Les jeux les mieux notés
	const topRatedQuery = `
		${fields}
		where rating_count > 50 & cover != null & summary != null & parent_game = null;
		sort rating desc;
		limit 350;
	`;

	// 2. Les sorties récentes (déjà sortis, triés par date)
	const recentQuery = `
		${fields}
		where first_release_date <= ${now} & first_release_date != null & cover != null & summary != null & parent_game = null & rating_count > 5;
		sort first_release_date desc;
		limit 100;
	`;

	// 3. Les jeux à venir (coming soon)
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

	// Combine et enlève les doublons par id
	const combined = [...topRes.data, ...recentRes.data, ...soonRes.data];
	const unique = Array.from(new Map(combined.map(g => [g.id, g])).values());

	console.log(`🎮 [SEED] ${unique.length} jeux récupérés depuis IGDB (top + récents + à venir). Insertion dans PostgreSQL...`);
	return unique;
}
/**
 * Insertion des jeux dans PostgreSQL avec Prisma
 * @param {*} rawGames les jeux récupérés depuis IGDB
 * @returns la liste des jeux insérés en DB
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
 * Génération de 20 faux utilisateurs
 * @returns les utilisateurs générés
 */
async function generateUsers()
{
	console.log("👥 [SEED] Génération des utilisateurs de test...");
	const insertedUsers = [];
	faker.seed(123);

	for (let i = 0; i < 20; i++) {
		const fakeUsername = faker.internet.username();
		const fakeEmail = faker.internet.email();

		const dbUser = await prisma.users.upsert({
		where: { email: fakeEmail },
		update: {},
		create: {
			username: fakeUsername,
			email: fakeEmail,
			// Mot de passe haché en dur pour les tests
			passwordHash: "$2b$10$EpjX0Zp2FfhkEa1k1F6Sbe6aUj683Uv9/y6R5Q9zIepFh.GfOnWKm", 
		},
		});
		insertedUsers.push(dbUser);
	}

	return insertedUsers;
}

/**
 * Génération de fausses reviews / notes
 * @param {*} insertedGames jeux déjà insérés en DB
 * @param {*} insertedUsers utilisateurs déjà insérés en DB
 */
async function generateReviews(insertedGames, insertedUsers)
{
	console.log("📝 [SEED] Génération des notes et des commentaires...");

	for (const game of insertedGames) {
		// Pour chaque jeu, on sélectionne entre 1 et 4 utilisateurs au hasard pour mettre un avis
		const randomUsers = faker.helpers.arrayElements(insertedUsers, faker.number.int({ min: 1, max: 4 }));

		for (const user of randomUsers) {
		await prisma.review.upsert({
			where: {
			unique_user_game_review: { userId: user.id, gameId: game.id } // Utilise l'index unique combiné
			},
			update: {},
			create: {
			userId: user.id,
			gameId: game.id,
			rating: faker.number.int({ min: 1, max: 5 }),
			reviewText: faker.lorem.paragraph(),
			},
		});
		}
	}
}

/**
 * main function of the seeding script
 */
async function main()
{
	console.log("🚀 [SEED] Début du peuplement de la base de données...");

	// ---------------------------------------------------------
	// Authentification Twitch / IGDB
	// ---------------------------------------------------------
	const clientId = process.env.TWITCH_CLIENT_ID;
	const clientSecret = process.env.TWITCH_CLIENT_SECRET;

	const accessToken = await connectToIGDB(clientId, clientSecret);

	// ---------------------------------------------------------
	// Récupération des 50 jeux depuis IGDB
	// ---------------------------------------------------------
	const rawGames = await getGames(clientId, accessToken);

	// ---------------------------------------------------------
	// Insertion des jeux dans PostgreSQL avec Prisma
	// ---------------------------------------------------------
	const insertedGames = await insertGames(rawGames);

	// ---------------------------------------------------------
	// Génération de 20 faux utilisateurs
	// ---------------------------------------------------------
	const insertedUsers = await generateUsers();

	// ---------------------------------------------------------
	// Génération de fausses reviews / notes
	// ---------------------------------------------------------
	await generateReviews(insertedGames, insertedUsers);

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

