import express from 'express';
import prisma from '../init/initPrisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ─── AVATAR ───

router.put('/avatar', authMiddleware, async (req, res) => {
	const { avatar } = req.body;
	if (!avatar) return res.status(400).json({ error: 'No image provided.' });
	if (avatar.length > 3_000_000) return res.status(413).json({ error: 'Image too large (max ~2MB).' });
	try {
		const updated = await prisma.users.update({
			where: { id: req.user.id },
			data: { avatarUrl: avatar },
			select: { id: true, username: true, email: true, avatarUrl: true },
		});
		res.json({ message: 'Avatar updated!', user: updated });
	} catch (error) {
		console.error('Erreur update avatar:', error);
		res.status(500).json({ error: 'Update failed.' });
	}
});

// Récupère les infos de l'utilisateur connecté
router.get('/me', authMiddleware, async (req, res) => {
	try {
		const user = await prisma.users.findUnique({
			where: { id: req.user.id },
			select: { id: true, username: true, email: true, avatarUrl: true, bio: true },
		});
		if (!user) return res.status(404).json({ error: 'User not found.' });
		res.json(user);
	} catch (error) {
		console.error('Erreur /me:', error);
		res.status(500).json({ error: 'Server error.' });
	}
});

// ─── JEUX LIKÉS ───

router.post('/like/:gameId', authMiddleware, async (req, res) => {
	try {
		let game = await prisma.game.findUnique({ where: { idExterne: req.params.gameId.toString() } })
		if (!game) {
			const { getGameById } = await import('../services/igdb.js')
			const igdbData = await getGameById(req.params.gameId.toString())
			if (!igdbData || igdbData.length === 0) return res.status(404).json({ error: 'Game not found.' })
			const g = igdbData[0]
			game = await prisma.game.create({
				data: {
					idExterne: req.params.gameId.toString(),
					title: g.name,
					summary: g.summary || null,
					releaseDate: g.first_release_date ? new Date(g.first_release_date * 1000) : null,
					coverImageUrl: g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : null,
					developer: g.involved_companies?.[0]?.company?.name || null,
				}
			})
		}
		const existing = await prisma.likedGame.findUnique({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } })
		if (existing) {
			await prisma.likedGame.delete({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } })
			return res.json({ liked: false })
		}
		await prisma.likedGame.create({ data: { userId: req.user.id, gameId: game.id } })
		res.json({ liked: true })
	} catch (error) {
		console.error('Erreur like:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

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
		res.status(500).json({ error: 'Server error.' });
	}
});

// ─── PLAYING LIST ───

router.post('/playing/:gameId', authMiddleware, async (req, res) => {
	try {
		let game = await prisma.game.findUnique({ where: { idExterne: req.params.gameId.toString() } })
		if (!game) {
			const { getGameById } = await import('../services/igdb.js')
			const igdbData = await getGameById(req.params.gameId.toString())
			if (!igdbData || igdbData.length === 0) return res.status(404).json({ error: 'Game not found.' })
			const g = igdbData[0]
			game = await prisma.game.create({
				data: {
					idExterne: req.params.gameId.toString(),
					title: g.name,
					summary: g.summary || null,
					releaseDate: g.first_release_date ? new Date(g.first_release_date * 1000) : null,
					coverImageUrl: g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : null,
					developer: g.involved_companies?.[0]?.company?.name || null,
				}
			})
		}
		const existing = await prisma.playingList.findUnique({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } })
		if (existing) {
			await prisma.playingList.delete({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } })
			return res.json({ inList: false })
		}
		await prisma.playingList.create({ data: { userId: req.user.id, gameId: game.id } })
		res.json({ inList: true })
	} catch (error) {
		console.error('Erreur playing:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

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
		res.status(500).json({ error: 'Server error.' });
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
		res.status(500).json({ error: 'Server error.' })
	}
})

router.post('/favorites/:gameId', authMiddleware, async (req, res) => {
	try {
		const idExterne = req.params.gameId.toString()
		let game = await prisma.game.findUnique({ where: { idExterne } })
		if (!game) {
			const { getGameById } = await import('../services/igdb.js')
			const igdbData = await getGameById(idExterne)
			if (!igdbData || igdbData.length === 0) return res.status(404).json({ error: 'Game not found on IGDB.' })
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
		if (existing) return res.status(409).json({ error: 'Already in favorites.' })
		const taken = await prisma.favoriteGame.findMany({ where: { userId: req.user.id }, select: { position: true } })
		const takenPositions = taken.map(f => f.position)
		if (takenPositions.length >= 4) return res.status(400).json({ error: 'Maximum 4 favorites.' })
		const position = [1, 2, 3, 4].find(p => !takenPositions.includes(p))
		const favorite = await prisma.favoriteGame.create({
			data: { userId: req.user.id, gameId: game.id, position },
			include: { game: true }
		})
		res.json({ ...favorite.game, position: favorite.position })
	} catch (error) {
		console.error('Erreur add favorite:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

router.delete('/favorites/:gameId', authMiddleware, async (req, res) => {
	try {
		const game = await prisma.game.findUnique({ where: { idExterne: req.params.gameId.toString() } })
		if (!game) return res.status(404).json({ error: 'Game not found.' })
		await prisma.favoriteGame.delete({ where: { userId_gameId: { userId: req.user.id, gameId: game.id } } })
		res.json({ message: 'Favorite removed.' })
	} catch (error) {
		console.error('Erreur delete favorite:', error)
		res.status(500).json({ error: 'Server error.' })
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
		res.status(500).json({ error: 'Server error.' });
	}
});

// ─── USERNAME ───

router.put('/username', authMiddleware, async (req, res) => {
	const { username } = req.body
	if (!username || username.trim() === '') return res.status(400).json({ error: 'Invalid username.' })
	try {
		const existing = await prisma.users.findUnique({ where: { username: username.trim() } })
		if (existing) return res.status(409).json({ error: 'Username already taken.' })
		const updated = await prisma.users.update({
			where: { id: req.user.id },
			data: { username: username.trim() },
			select: { id: true, username: true, email: true, avatarUrl: true }
		})
		res.json({ message: 'Username updated!', user: updated })
	} catch (error) {
		console.error('Erreur update username:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// ─── MOT DE PASSE ───

router.put('/password', authMiddleware, async (req, res) => {
	const { currentPassword, newPassword } = req.body
	if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields.' })
	if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })
	try {
		const user = await prisma.users.findUnique({ where: { id: req.user.id } })
		if (!user) return res.status(404).json({ error: 'User not found.' })
		const bcrypt = await import('bcrypt')
		const valid = await bcrypt.default.compare(currentPassword, user.passwordHash)
		if (!valid) return res.status(401).json({ error: 'Incorrect current password.' })
		const hashed = await bcrypt.default.hash(newPassword, 10)
		await prisma.users.update({ where: { id: req.user.id }, data: { passwordHash: hashed } })
		res.json({ message: 'Password updated!' })
	} catch (error) {
		console.error('Erreur update password:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// ─── SUPPRESSION COMPTE ───

router.delete('/delete', authMiddleware, async (req, res) => {
	const { password } = req.body
	try {
		const user = await prisma.users.findUnique({ where: { id: req.user.id } })
		if (!user) return res.status(404).json({ error: 'User not found.' })

		// Compte Google — pas de vérification de mot de passe
		if (user.passwordHash !== 'google_oauth') {
			if (!password) return res.status(400).json({ error: 'Password required.' })
			const bcrypt = await import('bcrypt')
			const valid = await bcrypt.default.compare(password, user.passwordHash)
			if (!valid) return res.status(401).json({ error: 'Incorrect password.' })
		}

		await prisma.apiKey.deleteMany({ where: { userId: req.user.id } })
		await prisma.users.delete({ where: { id: req.user.id } })
		res.json({ message: 'Account deleted.' })
	} catch (error) {
		console.error('Erreur delete user:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// ─── AMIS ───

router.get('/search', authMiddleware, async (req, res) => {
	const { q } = req.query
	if (!q || q.trim() === '') return res.status(400).json({ error: 'Empty query.' })
	try {
		const users = await prisma.users.findMany({
			where: { username: { contains: q.trim(), mode: 'insensitive' }, NOT: { id: req.user.id } },
			select: { id: true, username: true, avatarUrl: true },
			take: 10
		})
		res.json(users)
	} catch (error) {
		console.error('Erreur search users:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

router.post('/friend-request/:userId', authMiddleware, async (req, res) => {
	const targetId = parseInt(req.params.userId)
	if (targetId === req.user.id) return res.status(400).json({ error: 'You cannot follow yourself.' })
	try {
		const existing = await prisma.friendship.findFirst({ where: { userId1: req.user.id, userId2: targetId } })
		if (existing) return res.status(409).json({ error: 'Already following this user.' })
		await prisma.friendship.create({ data: { userId1: req.user.id, userId2: targetId, status: 'accepted' } })
		res.json({ message: 'Now following!' })
	} catch (error) {
		console.error('Erreur friend request:', error)
		res.status(500).json({ error: 'Server error.' })
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
		res.status(500).json({ error: 'Server error.' })
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
		res.status(500).json({ error: 'Server error.' })
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
		if (!user) return res.status(404).json({ error: 'User not found.' })

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
		res.status(500).json({ error: 'Server error.' })
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

		const [recentLikes, recentReviews, recentPlaying, recentFollows] = await Promise.all([
			prisma.likedGame.findMany({
				where: { userId: { in: followingIds } },
				include: {
					user: { select: { id: true, username: true, avatarUrl: true } },
					game: { select: { title: true, idExterne: true } }
				},
				orderBy: { likedAt: 'desc' },
				take: 20
			}),
			prisma.review.findMany({
				where: { userId: { in: followingIds } },
				include: {
					user: { select: { id: true, username: true, avatarUrl: true } },
					game: { select: { title: true, idExterne: true } }
				},
				orderBy: { createdAt: 'desc' },
				take: 20
			}),
			prisma.playingList.findMany({
				where: { userId: { in: followingIds } },
				include: {
					user: { select: { id: true, username: true, avatarUrl: true } },
					game: { select: { title: true, idExterne: true } }
				},
				orderBy: { addedAt: 'desc' },
				take: 20
			}),
			prisma.friendship.findMany({
				where: { userId1: { in: followingIds }, status: 'accepted' },
				include: {
					user1: { select: { id: true, username: true, avatarUrl: true } },
					user2: { select: { id: true, username: true } }
				},
				orderBy: { createdAt: 'desc' },
				take: 20
			})
		])

		const activities = [
			...recentLikes.map(l => ({
				userId: l.user.id, username: l.user.username, avatarUrl: l.user.avatarUrl,
				type: 'liked', action: 'liked', target: l.game.title,
				targetId: l.game.idExterne, targetType: 'game', date: l.likedAt
			})),
			...recentReviews.map(r => ({
				userId: r.user.id, username: r.user.username, avatarUrl: r.user.avatarUrl,
				type: 'reviewed', action: 'posted a review on', target: r.game.title,
				targetId: r.game.idExterne, targetType: 'game', date: r.createdAt,
				reviewId: r.id
			})),
			...recentPlaying.map(p => ({
				userId: p.user.id, username: p.user.username, avatarUrl: p.user.avatarUrl,
				type: 'playing', action: 'added to playing list', target: p.game.title,
				targetId: p.game.idExterne, targetType: 'game', date: p.addedAt
			})),
			...recentFollows.map(f => ({
				userId: f.user1.id, username: f.user1.username, avatarUrl: f.user1.avatarUrl,
				type: 'followed', action: 'started following', target: f.user2.username,
				targetId: f.user2.id, targetType: 'user', date: f.createdAt
			}))
		].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30)

		res.json(activities)
	} catch (error) {
		console.error('Erreur friends activity:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// Unfollow un user
router.delete('/follow/:userId', authMiddleware, async (req, res) => {
	const targetId = parseInt(req.params.userId)
	try {
		await prisma.friendship.deleteMany({
			where: { userId1: req.user.id, userId2: targetId }
		})
		res.json({ message: 'Unfollowed.' })
	} catch (error) {
		console.error('Erreur unfollow:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// Supprimer un follower
router.delete('/follower/:userId', authMiddleware, async (req, res) => {
	const followerId = parseInt(req.params.userId)
	try {
		await prisma.friendship.deleteMany({
			where: { userId1: followerId, userId2: req.user.id }
		})
		res.json({ message: 'Follower removed.' })
	} catch (error) {
		console.error('Erreur remove follower:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// ─── REVIEWS ───

router.post('/review', authMiddleware, async (req, res) => {
	const { gameId, rating, reviewText } = req.body
	if (!gameId || !rating) return res.status(400).json({ error: 'Game and rating are required.' })
	if (rating < 0.5 || rating > 5) return res.status(400).json({ error: 'Invalid rating (0.5 to 5).' })

	try {
		let game = await prisma.game.findUnique({ where: { idExterne: gameId.toString() } })
		if (!game) {
			const { getGameById } = await import('../services/igdb.js')
			const igdbData = await getGameById(gameId.toString())
			if (!igdbData || igdbData.length === 0) return res.status(404).json({ error: 'Game not found.' })
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
		if (existing) return res.status(409).json({ error: 'You already posted a review for this game.' })

		const ratingInt = Math.round(rating * 2)
		const review = await prisma.review.create({
			data: { userId: req.user.id, gameId: game.id, rating: ratingInt, reviewText: reviewText?.trim() || null },
			include: { game: true }
		})
		res.json({ message: 'Review posted!', review })
	} catch (error) {
		console.error('Erreur post review:', error)
		res.status(500).json({ error: 'Server error.' })
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
		res.status(500).json({ error: 'Server error.' })
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
		res.status(500).json({ error: 'Server error.' })
	}
})

// Reviews des users que je suis
router.get('/reviews/following', authMiddleware, async (req, res) => {
	try {
		const following = await prisma.friendship.findMany({
			where: { userId1: req.user.id, status: 'accepted' },
			select: { userId2: true }
		})
		const followingIds = following.map(f => f.userId2)
		if (followingIds.length === 0) return res.json([])

		const reviews = await prisma.review.findMany({
			where: { userId: { in: followingIds } },
			include: {
				game: true,
				user: { select: { id: true, username: true, avatarUrl: true } }
			},
			orderBy: { createdAt: 'desc' }
		})
		res.json(reviews)
	} catch (error) {
		console.error('Erreur reviews following:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// Modifier une review
router.put('/review/:reviewId', authMiddleware, async (req, res) => {
	const { rating, reviewText } = req.body
	const reviewId = parseInt(req.params.reviewId)

	try {
		const review = await prisma.review.findUnique({ where: { id: reviewId } })
		if (!review) return res.status(404).json({ error: 'Review not found.' })
		if (review.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized.' })

		const ratingInt = rating ? Math.round(rating * 2) : review.rating

		const updated = await prisma.review.update({
			where: { id: reviewId },
			data: {
				rating: ratingInt,
				reviewText: reviewText?.trim() ?? review.reviewText
			},
			include: { game: true }
		})
		res.json({ message: 'Review updated!', review: updated })
	} catch (error) {
		console.error('Erreur update review:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// Supprimer une review
router.delete('/review/:reviewId', authMiddleware, async (req, res) => {
	const reviewId = parseInt(req.params.reviewId)
	try {
		const review = await prisma.review.findUnique({ where: { id: reviewId } })
		if (!review) return res.status(404).json({ error: 'Review not found.' })
		if (review.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized.' })

		await prisma.review.delete({ where: { id: reviewId } })
		res.json({ message: 'Review deleted.' })
	} catch (error) {
		console.error('Erreur delete review:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// ─── LIKE / DISLIKE REVIEW ───

// Toggle like ou dislike sur une review
router.post('/review/:reviewId/like', authMiddleware, async (req, res) => {
	const reviewId = parseInt(req.params.reviewId)
	const { type } = req.body // 'like' ou 'dislike'

	if (!['like', 'dislike'].includes(type)) {
		return res.status(400).json({ error: 'Invalid type.' })
	}

	try {
		const existing = await prisma.reviewLike.findUnique({
			where: { userId_reviewId: { userId: req.user.id, reviewId } }
		})

		// Si même type → on retire (toggle off)
		if (existing && existing.type === type) {
			await prisma.reviewLike.delete({
				where: { userId_reviewId: { userId: req.user.id, reviewId } }
			})
			return res.json({ type: null })
		}

		// Sinon → on crée ou on met à jour
		await prisma.reviewLike.upsert({
			where: { userId_reviewId: { userId: req.user.id, reviewId } },
			update: { type },
			create: { userId: req.user.id, reviewId, type }
		})

		res.json({ type })
	} catch (error) {
		console.error('Erreur like/dislike:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// Récupère le statut like/dislike + compteurs pour une review
router.get('/review/:reviewId/likes', authMiddleware, async (req, res) => {
	const reviewId = parseInt(req.params.reviewId)
	try {
		const [likes, dislikes, userLike] = await Promise.all([
			prisma.reviewLike.count({ where: { reviewId, type: 'like' } }),
			prisma.reviewLike.count({ where: { reviewId, type: 'dislike' } }),
			prisma.reviewLike.findUnique({
				where: { userId_reviewId: { userId: req.user.id, reviewId } }
			})
		])
		res.json({ likes, dislikes, userType: userLike?.type || null })
	} catch (error) {
		console.error('Erreur get likes:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// ─── COMMENTAIRES REVIEW ───

// Ajoute un commentaire (avec support parentId pour les réponses)
router.post('/review/:reviewId/comment', authMiddleware, async (req, res) => {
	const reviewId = parseInt(req.params.reviewId)
	const { text, parentId } = req.body

	if (!text || text.trim() === '') {
		return res.status(400).json({ error: 'Comment cannot be empty.' })
	}

	try {
		const comment = await prisma.reviewComment.create({
			data: {
				reviewId,
				userId: req.user.id,
				text: text.trim(),
				parentId: parentId ? parseInt(parentId) : null
			},
			include: {
				user: { select: { id: true, username: true, avatarUrl: true } },
				replies: {
					include: { user: { select: { id: true, username: true, avatarUrl: true } } }
				}
			}
		})
		res.json(comment)
	} catch (error) {
		console.error('Erreur add comment:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// Récupère les commentaires racines + leurs réponses
router.get('/review/:reviewId/comments', authMiddleware, async (req, res) => {
	const reviewId = parseInt(req.params.reviewId)
	try {
		const comments = await prisma.reviewComment.findMany({
			where: { reviewId, parentId: null }, // seulement les commentaires racines
			include: {
				user: { select: { id: true, username: true, avatarUrl: true } },
				replies: {
					include: {
						user: { select: { id: true, username: true, avatarUrl: true } }
					},
					orderBy: { createdAt: 'asc' }
				}
			},
			orderBy: { createdAt: 'asc' }
		})
		res.json(comments)
	} catch (error) {
		console.error('Erreur get comments:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// Supprime un commentaire (seulement le sien)
router.delete('/comment/:commentId', authMiddleware, async (req, res) => {
	const commentId = parseInt(req.params.commentId)
	try {
		const comment = await prisma.reviewComment.findUnique({ where: { id: commentId } })
		if (!comment) return res.status(404).json({ error: 'Comment not found.' })
		if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized.' })

		await prisma.reviewComment.delete({ where: { id: commentId } })
		res.json({ message: 'Comment deleted.' })
	} catch (error) {
		console.error('Erreur delete comment:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

// ─── ACTIVITÉ UTILISATEUR ───

router.get('/activity/:userId', authMiddleware, async (req, res) => {
	const userId = parseInt(req.params.userId)
	try {
		const [recentLikes, recentReviews, recentFollows, recentPlaying] = await Promise.all([
			prisma.likedGame.findMany({
				where: { userId },
				include: { game: { select: { title: true, idExterne: true } } },
				orderBy: { likedAt: 'desc' },
				take: 10
			}),
			prisma.review.findMany({
				where: { userId },
				include: { game: { select: { title: true, idExterne: true } } },
				orderBy: { createdAt: 'desc' },
				take: 10
			}),
			prisma.friendship.findMany({
				where: { userId1: userId, status: 'accepted' },
				include: { user2: { select: { id: true, username: true } } },
				orderBy: { createdAt: 'desc' },
				take: 10
			}),
			prisma.playingList.findMany({
				where: { userId },
				include: { game: { select: { title: true, idExterne: true } } },
				orderBy: { addedAt: 'desc' },
				take: 10
			})
		])

		const activities = [
			...recentLikes.map(l => ({
				type: 'liked', action: 'liked',
				target: l.game.title, targetId: l.game.idExterne,
				targetType: 'game', date: l.likedAt, reviewId: null
			})),
			...recentReviews.map(r => ({
				type: 'reviewed', action: 'posted a review on',
				target: r.game.title, targetId: r.game.idExterne,
				targetType: 'game', date: r.createdAt, reviewId: r.id
			})),
			...recentFollows.map(f => ({
				type: 'followed', action: 'started following',
				target: f.user2.username, targetId: f.user2.id,
				targetType: 'user', date: f.createdAt, reviewId: null
			})),
			...recentPlaying.map(p => ({
				type: 'playing', action: 'added to playing list',
				target: p.game.title, targetId: p.game.idExterne,
				targetType: 'game', date: p.addedAt, reviewId: null
			}))
		].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15)

		res.json(activities)
	} catch (error) {
		console.error('Erreur activity:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

export default router;