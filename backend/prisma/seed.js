import axios from 'axios';
import { faker } from '@faker-js/faker';
import prisma from '../src/init/initPrisma.js'
import 'dotenv/config';

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

