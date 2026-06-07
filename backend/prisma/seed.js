import axios from 'axios';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import prisma from '../src/init/initPrisma.js' //prisma instance

// async function connectionToIGDB()
// {

// }

async function main()
{
	console.log("🚀 [SEED] Début du peuplement de la base de données...");

	// ---------------------------------------------------------
	// Authentification Twitch / IGDB
	// ---------------------------------------------------------
	const clientId = process.env.TWITCH_CLIENT_ID;
	const clientSecret = process.env.TWITCH_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error("Les variables TWITCH_CLIENT_ID et TWITCH_CLIENT_SECRET sont requises.");
	}

	const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
	const authResponse = await axios.post(authUrl);
	const accessToken = authResponse.data.access_token;

	console.log("🔑 [SEED] Jeton d'accès Twitch obtenu.");

	// ---------------------------------------------------------
	// Récupération des 50 jeux depuis IGDB
	// ---------------------------------------------------------
	const igdbUrl = 'https://api.igdb.com/v4/games';
	const apicalypseQuery = `
		fields name, summary, cover.url, genres.name, first_release_date;
		where rating_count > 50 & cover != null & summary != null;
		sort rating desc;
		limit 50;
	`;

	const gamesResponse = await axios.post(igdbUrl, apicalypseQuery, {
		headers: {
		'Client-ID': clientId,
		'Authorization': `Bearer ${accessToken}`,
		'Content-Type': 'text/plain'
		}
	});

	const rawGames = gamesResponse.data;
	console.log(`🎮 [SEED] ${rawGames.length} jeux récupérés depuis IGDB. Insertion dans PostgreSQL...`);

	// ---------------------------------------------------------
	// Insertion des jeux dans PostgreSQL avec Prisma
	// ---------------------------------------------------------
	const insertedGames = [];

	for (const game of rawGames) {
		const hdCoverUrl = game.cover?.url 
		? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` 
		: 'https://via.placeholder.com/300x400?text=No+Cover';

		const genresList = game.genres ? game.genres.map(g => g.name).join(', ') : 'Inconnu';
		const dateDeSortie = game.first_release_date ? new Date(game.first_release_date * 1000) : null;

		// Utilisation de l'upsert Prisma
		const dbGame = await prisma.game.upsert({
		where: { idExterne: game.id.toString() },
		update: {}, // Ne fait rien si le jeu existe déjà
		create: {
			idExterne: game.id.toString(),
			title: game.name,
			summary: game.summary,
			coverImageUrl: hdCoverUrl,
			genre: genresList,
			releaseDate: dateDeSortie,
		},
		});
		insertedGames.push(dbGame);
	}
	console.log(`✅ [SEED] ${insertedGames.length} jeux synchronisés en base de données.`);

	// ---------------------------------------------------------
	// Génération de 20 faux utilisateurs
	// ---------------------------------------------------------
	console.log("👥 [SEED] Génération des utilisateurs de test...");
	const insertedUsers = [];
	
	for (let i = 0; i < 20; i++) {
		const fakeUsername = faker.internet.username(123);
		const fakeEmail = faker.internet.email(123);

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

	// ---------------------------------------------------------
	// Génération de fausses reviews / notes
	// ---------------------------------------------------------
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

