import express from 'express';
import {
	getNewReleases,
	getHighlyPraised,
	getGameById,
	searchGames,
	getPopularGames,
	getComingSoon,
} from '../services/igdb.js';
import prisma from '../init/initPrisma.js'
import { getByGenre, getByTheme, getByGameMode } from '../services/igdb.js';

const router = express.Router();

const CATEGORY_MAP = {
	shooter: { field: 'genre', value: 'Shooter' },
	rpg: { field: 'genre', value: 'Role-playing (RPG)' },
	adventure: { field: 'genre', value: 'Adventure' },
	fighting: { field: 'genre', value: 'Fighting' },
	strategy: { field: 'genre', value: 'Strategy' },
	simulator: { field: 'genre', value: 'Simulator' },
	racing: { field: 'genre', value: 'Racing' },
	indie: { field: 'genre', value: 'Indie' },
	platform: { field: 'genre', value: 'Platform' },
	sport: { field: 'genre', value: 'Sport' },
	horror: { field: 'themes', value: 'Horror' },
	survival: { field: 'themes', value: 'Survival' },
	openworld: { field: 'themes', value: 'Open world' },
	action: { field: 'themes', value: 'Action' },
	scifi: { field: 'themes', value: 'Science fiction' },
	fantasy: { field: 'themes', value: 'Fantasy' },
	stealth: { field: 'themes', value: 'Stealth' },
	multiplayer: { field: 'gameModes', value: 'Multiplayer' },
	solo: { field: 'gameModes', value: 'Single player' },
	coop: { field: 'gameModes', value: 'Co-operative' },
};

router.get('/new-releases', async (req, res) => {
	try {
		const games = await prisma.game.findMany({
			where: { releaseDate: { not: null } },
			orderBy: { releaseDate: 'desc' },
			take: 40,
		})
		res.json(games)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/highly-praised', async (req, res) => {
	try {
		const games = await prisma.game.findMany({
			where: { rating: { not: null } },
			orderBy: { rating: 'desc' },
			take: 40,
		})
		res.json(games)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/popular', async (req, res) => {
	try {
		const games = await prisma.game.findMany({
			include: { reviews: true },
			take: 100,
		})
		const sorted = games
			.sort((a, b) => b.reviews.length - a.reviews.length)
			.slice(0, 40)
		res.json(sorted)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/coming-soon', async (req, res) => {
	try {
		const now = new Date()
		const dbGames = await prisma.game.findMany({
			where: { releaseDate: { gt: now } },
			orderBy: { releaseDate: 'asc' },
			take: 40,
		})

		if (dbGames.length >= 10) {
			return res.json(dbGames)
		}

		// Complète avec IGDB si pas assez de résultats en DB
		const { getComingSoon } = await import('../services/igdb.js')
		const igdbGames = await getComingSoon()

		const dbIdExternes = new Set(dbGames.map(g => g.idExterne))
		const igdbFiltered = igdbGames.filter(g => !dbIdExternes.has(g.id?.toString()))

		res.json([...dbGames, ...igdbFiltered])
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/search', async (req, res) => {
	const { q } = req.query;
	if (!q) return res.status(400).json({ error: 'Paramètre q manquant' });

	try {
		// 1. Cherche d'abord dans la DB (résultats instantanés)
		const dbGames = await prisma.game.findMany({
			where: {
				title: { contains: q, mode: 'insensitive' }
			},
			orderBy: { ratingCount: 'desc' },
			take: 10,
		})

		// 2. Si assez de résultats en DB, on renvoie direct
		if (dbGames.length >= 5) {
			return res.json(dbGames)
		}

		// 3. Sinon, complète avec IGDB
		const igdbGames = await searchGames(q)
		const sorted = igdbGames.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0))

		// 4. Fusionne en évitant les doublons (par idExterne)
		const dbIdExternes = new Set(dbGames.map(g => g.idExterne))
		const igdbFiltered = sorted
			.filter(g => !dbIdExternes.has(g.id?.toString()))
			.slice(0, 20)

		// 5. Renvoie DB en premier (format DB), puis IGDB (format brut)
		res.json([...dbGames, ...igdbFiltered])
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur recherche' })
	}
})

router.get('/all', async (req, res) => {
	try {
		const games = await prisma.game.findMany({
			orderBy: { title: 'asc' },
		})
		res.json(games)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/category/:name', async (req, res) => {
	const cat = CATEGORY_MAP[req.params.name];
	if (!cat) return res.status(404).json({ error: 'Catégorie inconnue' });
	try {
		const games = await prisma.game.findMany({
			where: {
				[cat.field]: { contains: cat.value, mode: 'insensitive' }
			},
			orderBy: { rating: 'desc' },
			take: 40,
		});
		res.json(games);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur DB' });
	}
});

router.get('/recent-acclaimed', async (req, res) => {
	try {
		// Jeux sortis dans les 2 dernières années, bien notés
		const twoYearsAgo = new Date()
		twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 1)

		const games = await prisma.game.findMany({
			where: {
				releaseDate: { gte: twoYearsAgo },
				rating: { not: null },
			},
			orderBy: { rating: 'desc' },
			take: 40,
		})
		res.json(games)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const idExterne = req.params.id.toString()

		// Cherche d'abord en DB avec les reviews
		const dbGame = await prisma.game.findUnique({
			where: { idExterne },
			include: {
				reviews: {
					include: { user: { select: { id: true, username: true, avatarUrl: true } } },
					orderBy: { createdAt: 'desc' }
				}
			}
		})

		// Récupère les données IGDB pour compléter (screenshots, genres, etc.)
		const igdbData = await getGameById(idExterne)
		const igdb = igdbData?.[0] || null

		if (!igdb && !dbGame) return res.status(404).json(null)

		// Fusionne : données IGDB (riches) + reviews de la DB
		res.json({
			...igdb,
			...dbGame,
			reviews: dbGame?.reviews || []
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur IGDB' })
	}
})

export default router;