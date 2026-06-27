import express from 'express';
import prisma from '../init/initPrisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ─── AVATAR ───

router.put('/avatar', authMiddleware, async (req, res) => {
	const { avatar } = req.body;
	if (!avatar) return res.status(400).json({ error: 'Aucune image fournie.' });
	if (avatar.length > 3_000_000) return res.status(413).json({ error: 'Image trop lourde (max ~2MB).' });
	try {
		const updated = await prisma.users.update({
			where: { id: req.user.id },
			data: { avatarUrl: avatar },
			select: { id: true, username: true, email: true, avatarUrl: true },
		});
		res.json({ message: 'Avatar mis à jour !', user: updated });
	} catch (error) {
		console.error('Erreur update avatar:', error);
		res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
	}
});

// Récupère les infos de l'utilisateur connecté
router.get('/me', authMiddleware, async (req, res) => {
	try {
		const user = await prisma.users.findUnique({
			where: { id: req.user.id },
			select: { id: true, username: true, email: true, avatarUrl: true, bio: true },
		});
		if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
		res.json(user);
	} catch (error) {
		console.error('Erreur /me:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

// ─── JEUX LIKÉS ───

router.post('/like/:gameId', authMiddleware, async (req, res) => {
	try {
		const game = await prisma.game.findUnique({ where: { idExterne: req.params.gameId.toString() } });
		if (!game) return res.status(404).json({ error: 'Jeu introuvable.' });
		const existing = await prisma.likedGame.findUnique({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } });
		if (existing) {
			await prisma.likedGame.delete({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } });
			return res.json({ liked: false });
		}
		await prisma.likedGame.create({ data: { userId: req.user.id, gameId: game.id } });
		res.json({ liked: true });
	} catch (error) {
		console.error('Erreur like:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

router.get('/liked', authMiddleware, async (req, res) => {
	try {
		const liked = await prisma.likedGame.findMany({
			where: { userId: req.user.id },
			include: { game: true },
			orderBy: { likedAt: 'desc' },
		});
		res.json(liked.map(l => l.game));
	} catch (error) {
		console.error('Erreur liked:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

// ─── PLAYING LIST ───

router.post('/playing/:gameId', authMiddleware, async (req, res) => {
	try {
		const game = await prisma.game.findUnique({ where: { idExterne: req.params.gameId.toString() } });
		if (!game) return res.status(404).json({ error: 'Jeu introuvable.' });
		const existing = await prisma.playingList.findUnique({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } });
		if (existing) {
			await prisma.playingList.delete({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } });
			return res.json({ inList: false });
		}
		await prisma.playingList.create({ data: { userId: req.user.id, gameId: game.id } });
		res.json({ inList: true });
	} catch (error) {
		console.error('Erreur playing:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

router.get('/playing', authMiddleware, async (req, res) => {
	try {
		const list = await prisma.playingList.findMany({
			where: { userId: req.user.id },
			include: { game: true },
			orderBy: { addedAt: 'desc' },
		});
		res.json(list.map(p => p.game));
	} catch (error) {
		console.error('Erreur playing list:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

// ─── FAVORITE GAMES ───

router.get('/favorites', authMiddleware, async (req, res) => {
	try {
		const favorites = await prisma.favoriteGame.findMany({
			where: { userId: req.user.id },
			include: { game: true },
			orderBy: { position: 'asc' }
		})
		res.json(favorites.map(f => ({ ...f.game, position: f.position })))
	} catch (error) {
		console.error('Erreur favorites:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

router.post('/favorites/:gameId', authMiddleware, async (req, res) => {
	try {
		const idExterne = req.params.gameId.toString()
		let game = await prisma.game.findUnique({ where: { idExterne } })
		if (!game) {
			const { getGameById } = await import('../services/igdb.js')
			const igdbData = await getGameById(idExterne)
			if (!igdbData || igdbData.length === 0) return res.status(404).json({ error: 'Jeu introuvable sur IGDB.' })
			const g = igdbData[0]
			game = await prisma.game.create({
				data: {
					idExterne,
					title: g.name,
					summary: g.summary || null,
					releaseDate: g.first_release_date ? new Date(g.first_release_date * 1000) : null,
					coverImageUrl: g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : null,
					developer: g.involved_companies?.[0]?.company?.name || null,
				}
			})
		}
		const existing = await prisma.favoriteGame.findFirst({ where: { userId: req.user.id, gameId: game.id } })
		if (existing) return res.status(409).json({ error: 'Déjà en favori.' })
		const taken = await prisma.favoriteGame.findMany({ where: { userId: req.user.id }, select: { position: true } })
		const takenPositions = taken.map(f => f.position)
		if (takenPositions.length >= 4) return res.status(400).json({ error: 'Maximum 4 favoris.' })
		const position = [1, 2, 3, 4].find(p => !takenPositions.includes(p))
		const favorite = await prisma.favoriteGame.create({
			data: { userId: req.user.id, gameId: game.id, position },
			include: { game: true }
		})
		res.json({ ...favorite.game, position: favorite.position })
	} catch (error) {
		console.error('Erreur add favorite:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

router.delete('/favorites/:gameId', authMiddleware, async (req, res) => {
	try {
		const game = await prisma.game.findUnique({ where: { idExterne: req.params.gameId.toString() } })
		if (!game) return res.status(404).json({ error: 'Jeu introuvable.' })
		await prisma.favoriteGame.delete({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } })
		res.json({ message: 'Favori supprimé.' })
	} catch (error) {
		console.error('Erreur delete favorite:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── STATUS ───

router.get('/status/:gameId', authMiddleware, async (req, res) => {
	try {
		const game = await prisma.game.findUnique({ where: { idExterne: req.params.gameId.toString() } });
		if (!game) return res.json({ liked: false, inPlayingList: false });
		const [liked, playing] = await Promise.all([
			prisma.likedGame.findUnique({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } }),
			prisma.playingList.findUnique({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } }),
		]);
		res.json({ liked: !!liked, inPlayingList: !!playing });
	} catch (error) {
		console.error('Erreur status:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

// ─── USERNAME ───

router.put('/username', authMiddleware, async (req, res) => {
	const { username } = req.body
	if (!username || username.trim() === '') return res.status(400).json({ error: 'Username invalide.' })
	try {
		const existing = await prisma.users.findUnique({ where: { username: username.trim() } })
		if (existing) return res.status(409).json({ error: 'Ce username est déjà pris.' })
		const updated = await prisma.users.update({
			where: { id: req.user.id },
			data: { username: username.trim() },
			select: { id: true, username: true, email: true, avatarUrl: true }
		})
		res.json({ message: 'Username mis à jour !', user: updated })
	} catch (error) {
		console.error('Erreur update username:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── MOT DE PASSE ───

router.put('/password', authMiddleware, async (req, res) => {
	const { currentPassword, newPassword } = req.body
	if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Champs manquants.' })
	if (newPassword.length < 6) return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' })
	try {
		const user = await prisma.users.findUnique({ where: { id: req.user.id } })
		if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' })
		const bcrypt = await import('bcrypt')
		const valid = await bcrypt.default.compare(currentPassword, user.passwordHash)
		if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' })
		const hashed = await bcrypt.default.hash(newPassword, 10)
		await prisma.users.update({ where: { id: req.user.id }, data: { passwordHash: hashed } })
		res.json({ message: 'Mot de passe mis à jour !' })
	} catch (error) {
		console.error('Erreur update password:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── SUPPRESSION COMPTE ───

router.delete('/delete', authMiddleware, async (req, res) => {
	try {
		await prisma.apiKey.deleteMany({ where: { userId: req.user.id } })
		await prisma.users.delete({ where: { id: req.user.id } })
		res.json({ message: 'Compte supprimé.' })
	} catch (error) {
		console.error('Erreur delete user:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── AMIS ───

router.get('/search', authMiddleware, async (req, res) => {
	const { q } = req.query
	if (!q || q.trim() === '') return res.status(400).json({ error: 'Requête vide.' })
	try {
		const users = await prisma.users.findMany({
			where: { username: { contains: q.trim(), mode: 'insensitive' }, NOT: { id: req.user.id } },
			select: { id: true, username: true, avatarUrl: true },
			take: 10
		})
		res.json(users)
	} catch (error) {
		console.error('Erreur search users:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

router.post('/friend-request/:userId', authMiddleware, async (req, res) => {
	const targetId = parseInt(req.params.userId)
	if (targetId === req.user.id) return res.status(400).json({ error: 'Tu ne peux pas t\'ajouter toi-même.' })
	try {
		const existing = await prisma.friendship.findFirst({ where: { userId1: req.user.id, userId2: targetId } })
		if (existing) return res.status(409).json({ error: 'Demande déjà envoyée ou déjà amis.' })
		await prisma.friendship.create({ data: { userId1: req.user.id, userId2: targetId, status: 'accepted' } })
		res.json({ message: 'Demande envoyée !' })
	} catch (error) {
		console.error('Erreur friend request:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── FOLLOW ───

router.get('/following', authMiddleware, async (req, res) => {
	try {
		const following = await prisma.friendship.findMany({
			where: { userId1: req.user.id, status: 'accepted' },
			include: { user2: { select: { id: true, username: true, avatarUrl: true } } }
		})
		res.json(following.map(f => f.user2))
	} catch (error) {
		console.error('Erreur following:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

router.get('/followers', authMiddleware, async (req, res) => {
	try {
		const followers = await prisma.friendship.findMany({
			where: { userId2: req.user.id, status: 'accepted' },
			include: { user1: { select: { id: true, username: true, avatarUrl: true } } }
		})
		res.json(followers.map(f => f.user1))
	} catch (error) {
		console.error('Erreur followers:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── PROFIL PUBLIC ───

router.get('/profile/:userId', authMiddleware, async (req, res) => {
	const userId = parseInt(req.params.userId)
	try {
		const user = await prisma.users.findUnique({
			where: { id: userId },
			select: { id: true, username: true, avatarUrl: true }
		})
		if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' })

		const [followers, following, likedGames, playingList, favoriteGames, reviews] = await Promise.all([
			prisma.friendship.findMany({
				where: { userId2: userId, status: 'accepted' },
				include: { user1: { select: { id: true, username: true, avatarUrl: true } } }
			}),
			prisma.friendship.findMany({
				where: { userId1: userId, status: 'accepted' },
				include: { user2: { select: { id: true, username: true, avatarUrl: true } } }
			}),
			prisma.likedGame.findMany({
				where: { userId },
				include: { game: true },
				orderBy: { likedAt: 'desc' }
			}),
			prisma.playingList.findMany({
				where: { userId },
				include: { game: true },
				orderBy: { addedAt: 'desc' }
			}),
			prisma.favoriteGame.findMany({
				where: { userId },
				include: { game: true },
				orderBy: { position: 'asc' }
			}),
			prisma.review.findMany({
				where: { userId },
				include: { game: true },
				orderBy: { createdAt: 'desc' }
			})
		])

		res.json({
			user,
			followers: followers.map(f => f.user1),
			following: following.map(f => f.user2),
			likedGames: likedGames.map(l => l.game),
			playingList: playingList.map(p => p.game),
			favoriteGames: favoriteGames.map(f => ({ ...f.game, position: f.position })),
			reviews
		})
	} catch (error) {
		console.error('Erreur profil public:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── ACTIVITÉ AMIS ───

router.get('/friends-activity', authMiddleware, async (req, res) => {
	try {
		const following = await prisma.friendship.findMany({
			where: { userId1: req.user.id, status: 'accepted' },
			select: { userId2: true }
		})
		const followingIds = following.map(f => f.userId2)
		if (followingIds.length === 0) return res.json([])

		const recentLikes = await prisma.likedGame.findMany({
			where: { userId: { in: followingIds } },
			include: {
				user: { select: { id: true, username: true, avatarUrl: true } },
				game: { select: { title: true, idExterne: true } }
			},
			orderBy: { likedAt: 'desc' },
			take: 20
		})

		const activities = recentLikes.map(l => ({
			userId: l.user.id,
			username: l.user.username,
			avatarUrl: l.user.avatarUrl,
			action: 'liked',
			target: l.game.title,
			targetId: l.game.idExterne,
			targetType: 'game',
			date: l.likedAt
		}))

		res.json(activities)
	} catch (error) {
		console.error('Erreur friends activity:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── REVIEWS ───

router.post('/review', authMiddleware, async (req, res) => {
	const { gameId, rating, reviewText } = req.body
	if (!gameId || !rating) return res.status(400).json({ error: 'Jeu et note obligatoires.' })
	if (rating < 0.5 || rating > 5) return res.status(400).json({ error: 'Note invalide (0.5 à 5).' })

	try {
		let game = await prisma.game.findUnique({ where: { idExterne: gameId.toString() } })
		if (!game) {
			const { getGameById } = await import('../services/igdb.js')
			const igdbData = await getGameById(gameId.toString())
			if (!igdbData || igdbData.length === 0) return res.status(404).json({ error: 'Jeu introuvable.' })
			const g = igdbData[0]
			game = await prisma.game.create({
				data: {
					idExterne: gameId.toString(),
					title: g.name,
					summary: g.summary || null,
					releaseDate: g.first_release_date ? new Date(g.first_release_date * 1000) : null,
					coverImageUrl: g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : null,
					developer: g.involved_companies?.[0]?.company?.name || null,
				}
			})
		}

		const existing = await prisma.review.findUnique({
			where: { unique_user_game_review: { userId: req.user.id, gameId: game.id } }
		})
		if (existing) return res.status(409).json({ error: 'Tu as déjà posté une review pour ce jeu.' })

		const ratingInt = Math.round(rating * 2)
		const review = await prisma.review.create({
			data: { userId: req.user.id, gameId: game.id, rating: ratingInt, reviewText: reviewText?.trim() || null },
			include: { game: true }
		})
		res.json({ message: 'Review publiée !', review })
	} catch (error) {
		console.error('Erreur post review:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

router.get('/reviews', authMiddleware, async (req, res) => {
	try {
		const reviews = await prisma.review.findMany({
			where: { userId: req.user.id },
			include: { game: true },
			orderBy: { createdAt: 'desc' }
		})
		res.json(reviews)
	} catch (error) {
		console.error('Erreur reviews:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

router.get('/reviews/all', authMiddleware, async (req, res) => {
	try {
		const reviews = await prisma.review.findMany({
			where: { userId: { not: req.user.id } },
			include: {
				game: true,
				user: { select: { id: true, username: true, avatarUrl: true } }
			},
			orderBy: { createdAt: 'desc' }
		})
		res.json(reviews)
	} catch (error) {
		console.error('Erreur reviews all:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// Modifier une review
router.put('/review/:reviewId', authMiddleware, async (req, res) => {
	const { rating, reviewText } = req.body
	const reviewId = parseInt(req.params.reviewId)

	try {
		const review = await prisma.review.findUnique({ where: { id: reviewId } })
		if (!review) return res.status(404).json({ error: 'Review introuvable.' })
		if (review.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé.' })

		const ratingInt = rating ? Math.round(rating * 2) : review.rating

		const updated = await prisma.review.update({
			where: { id: reviewId },
			data: {
				rating: ratingInt,
				reviewText: reviewText?.trim() ?? review.reviewText
			},
			include: { game: true }
		})
		res.json({ message: 'Review modifiée !', review: updated })
	} catch (error) {
		console.error('Erreur update review:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// Supprimer une review
router.delete('/review/:reviewId', authMiddleware, async (req, res) => {
	const reviewId = parseInt(req.params.reviewId)
	try {
		const review = await prisma.review.findUnique({ where: { id: reviewId } })
		if (!review) return res.status(404).json({ error: 'Review introuvable.' })
		if (review.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé.' })

		await prisma.review.delete({ where: { id: reviewId } })
		res.json({ message: 'Review supprimée.' })
	} catch (error) {
		console.error('Erreur delete review:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

export default router;