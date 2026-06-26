import express from 'express';
import prisma from '../init/initPrisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ─── AVATAR ───

// Met à jour l'avatar de l'utilisateur connecté
router.put('/avatar', authMiddleware, async (req, res) => {
	const { avatar } = req.body; // image en base64

	if (!avatar) {
		return res.status(400).json({ error: 'Aucune image fournie.' });
	}

	if (avatar.length > 3_000_000) {
		return res.status(413).json({ error: 'Image trop lourde (max ~2MB).' });
	}

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

// Like / unlike un jeu (toggle) — gameId = idExterne IGDB
router.post('/like/:gameId', authMiddleware, async (req, res) => {
	try {
		// Trouve le jeu en DB par son idExterne
		const game = await prisma.game.findUnique({
			where: { idExterne: req.params.gameId.toString() }
		});
		if (!game) return res.status(404).json({ error: 'Jeu introuvable.' });

		const existing = await prisma.likedGame.findUnique({
			where: { userId_gameId: { userId: req.user.id, gameId: game.id } }
		});

		if (existing) {
			await prisma.likedGame.delete({
				where: { userId_gameId: { userId: req.user.id, gameId: game.id } }
			});
			return res.json({ liked: false });
		}

		await prisma.likedGame.create({
			data: { userId: req.user.id, gameId: game.id }
		});
		res.json({ liked: true });
	} catch (error) {
		console.error('Erreur like:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

// Récupère les jeux likés de l'utilisateur connecté
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

// Ajoute / retire un jeu de la playing list (toggle) — gameId = idExterne IGDB
router.post('/playing/:gameId', authMiddleware, async (req, res) => {
	try {
		const game = await prisma.game.findUnique({
			where: { idExterne: req.params.gameId.toString() }
		});
		if (!game) return res.status(404).json({ error: 'Jeu introuvable.' });

		const existing = await prisma.playingList.findUnique({
			where: { userId_gameId: { userId: req.user.id, gameId: game.id } }
		});

		if (existing) {
			await prisma.playingList.delete({
				where: { userId_gameId: { userId: req.user.id, gameId: game.id } }
			});
			return res.json({ inList: false });
		}

		await prisma.playingList.create({
			data: { userId: req.user.id, gameId: game.id }
		});
		res.json({ inList: true });
	} catch (error) {
		console.error('Erreur playing:', error);
		res.status(500).json({ error: 'Erreur serveur.' });
	}
});

// Récupère la playing list de l'utilisateur connecté
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

// Vérifie le statut (liké ? dans la playing list ?) d'un jeu — gameId = idExterne IGDB
router.get('/status/:gameId', authMiddleware, async (req, res) => {
	try {
		const game = await prisma.game.findUnique({
			where: { idExterne: req.params.gameId.toString() }
		});
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

	if (!username || username.trim() === '') {
		return res.status(400).json({ error: 'Username invalide.' })
	}

	try {
		const existing = await prisma.users.findUnique({
			where: { username: username.trim() }
		})
		if (existing) {
			return res.status(409).json({ error: 'Ce username est déjà pris.' })
		}

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

	if (!currentPassword || !newPassword) {
		return res.status(400).json({ error: 'Champs manquants.' })
	}

	if (newPassword.length < 6) {
		return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' })
	}

	try {
		const user = await prisma.users.findUnique({ where: { id: req.user.id } })
		if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' })

		const bcrypt = await import('bcrypt')
		const valid = await bcrypt.default.compare(currentPassword, user.passwordHash)
		if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' })

		const hashed = await bcrypt.default.hash(newPassword, 10)
		await prisma.users.update({
			where: { id: req.user.id },
			data: { passwordHash: hashed }
		})

		res.json({ message: 'Mot de passe mis à jour !' })
	} catch (error) {
		console.error('Erreur update password:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── SUPPRESSION COMPTE ───

router.delete('/delete', authMiddleware, async (req, res) => {
	try {
		// ApiKey n'a pas de onDelete: Cascade → suppression manuelle
		await prisma.apiKey.deleteMany({ where: { userId: req.user.id } })
		// Le reste (likes, playingList, reviews, friendships) → Cascade automatique
		await prisma.users.delete({ where: { id: req.user.id } })
		res.json({ message: 'Compte supprimé.' })
	} catch (error) {
		console.error('Erreur delete user:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── AMIS ───

// Rechercher un utilisateur par username
router.get('/search', authMiddleware, async (req, res) => {
	const { q } = req.query
	if (!q || q.trim() === '') return res.status(400).json({ error: 'Requête vide.' })

	try {
		const users = await prisma.users.findMany({
			where: {
				username: { contains: q.trim(), mode: 'insensitive' },
				NOT: { id: req.user.id } // exclut soi-même
			},
			select: { id: true, username: true, avatarUrl: true },
			take: 10
		})
		res.json(users)
	} catch (error) {
		console.error('Erreur search users:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// Envoyer une demande d'ami
router.post('/friend-request/:userId', authMiddleware, async (req, res) => {
	const targetId = parseInt(req.params.userId)
	if (targetId === req.user.id) return res.status(400).json({ error: 'Tu ne peux pas t\'ajouter toi-même.' })

	try {
		// Vérifie si une relation existe déjà
		const existing = await prisma.friendship.findFirst({
			where: {
				userId1: req.user.id,
				userId2: targetId
			}
		})
		if (existing) return res.status(409).json({ error: 'Demande déjà envoyée ou déjà amis.' })

		await prisma.friendship.create({
			data: { userId1: req.user.id, userId2: targetId, status: 'accepted' }
		})
		res.json({ message: 'Demande envoyée !' })
	} catch (error) {
		console.error('Erreur friend request:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// ─── FOLLOW ───

// Récupère les abonnements (qui je suis)
router.get('/following', authMiddleware, async (req, res) => {
	try {
		const following = await prisma.friendship.findMany({
			where: { userId1: req.user.id, status: 'accepted' },
			include: {
				user2: { select: { id: true, username: true, avatarUrl: true } }
			}
		})
		res.json(following.map(f => f.user2))
	} catch (error) {
		console.error('Erreur following:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// Récupère les abonnés (qui me suit)
router.get('/followers', authMiddleware, async (req, res) => {
	try {
		const followers = await prisma.friendship.findMany({
			where: { userId2: req.user.id, status: 'accepted' },
			include: {
				user1: { select: { id: true, username: true, avatarUrl: true } }
			}
		})
		res.json(followers.map(f => f.user1))
	} catch (error) {
		console.error('Erreur followers:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

// Profil public d'un user par son id
router.get('/profile/:userId', authMiddleware, async (req, res) => {
	const userId = parseInt(req.params.userId)
	try {
		const user = await prisma.users.findUnique({
			where: { id: userId },
			select: { id: true, username: true, avatarUrl: true }
		})
		if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' })

		const [followers, following, likedGames, playingList] = await Promise.all([
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
			})
		])

		res.json({
			user,
			followers: followers.map(f => f.user1),
			following: following.map(f => f.user2),
			likedGames: likedGames.map(l => l.game),
			playingList: playingList.map(p => p.game)
		})
	} catch (error) {
		console.error('Erreur profil public:', error)
		res.status(500).json({ error: 'Erreur serveur.' })
	}
})

export default router;