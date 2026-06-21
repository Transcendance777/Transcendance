import express from 'express';
import {
	getNewReleases,
	getHighlyPraised,
	getGameById,
	searchGames,
	getPopularGames,
	getComingSoon,
} from '../services/igdb.js';

const router = express.Router();

router.get('/new-releases', async (req, res) => {
	try {
		const games = await getNewReleases();
		res.json(games);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur IGDB' });
	}
});

router.get('/highly-praised', async (req, res) => {
	try {
		const games = await getHighlyPraised();
		res.json(games);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur IGDB' });
	}
});

router.get('/popular', async (req, res) => {
	try {
		const games = await getPopularGames();
		res.json(games);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur IGDB' });
	}
});

router.get('/coming-soon', async (req, res) => {
	try {
		const games = await getComingSoon();
		res.json(games);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur IGDB' });
	}
});

router.get('/search', async (req, res) => {
	const { q } = req.query;
	if (!q) return res.status(400).json({ error: 'Paramètre q manquant' });
	try {
		const games = await searchGames(q);
		res.json(games);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur IGDB' });
	}
});

router.get('/:id', async (req, res) => {
	try {
		const game = await getGameById(req.params.id);
		res.json(game[0] || null);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur IGDB' });
	}
});

export default router;