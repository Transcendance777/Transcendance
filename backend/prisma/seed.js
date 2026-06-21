import express from 'express';
import prisma from '../init/initPrisma.js';
import { getGameById, searchGames } from '../services/igdb.js';

const router = express.Router();

router.get('/new-releases', async (req, res) => {
	try {
		const games = await prisma.game.findMany({
			where: { releaseDate: { not: null } },
			orderBy: { releaseDate: 'desc' },
			take: 20,
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
			include: {
				reviews: true
			},
			take: 100,
		})
		const sorted = games
			.filter(g => g.reviews.length > 0)
			.map(g => ({
				...g,
				avgRating: g.reviews.reduce((sum, r) => sum + r.rating, 0) / g.reviews.length
			}))
			.sort((a, b) => b.avgRating - a.avgRating)
			.slice(0, 20)
		res.json(sorted)
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
			.slice(0, 20)
		res.json(sorted)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/coming-soon', async (req, res) => {
	try {
		const now = new Date()
		const games = await prisma.game.findMany({
			where: { releaseDate: { gt: now } },
			orderBy: { releaseDate: 'asc' },
			take: 20,
		})
		res.json(games)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/search', async (req, res) => {
	const { q } = req.query
	if (!q) return res.status(400).json({ error: 'Paramètre q manquant' })
	try {
		const games = await prisma.game.findMany({
			where: {
				title: { contains: q, mode: 'insensitive' }
			},
			take: 20,
		})
		res.json(games)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const game = await prisma.game.findFirst({
			where: { idExterne: req.params.id.toString() },
			include: { reviews: { include: { user: true } } }
		})
		if (!game) {
			// Si pas en DB, appel IGDB
			const igdbGame = await getGameById(req.params.id)
			return res.json(igdbGame[0] || null)
		}
		res.json(game)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Erreur DB' })
	}
})

export default router;