import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../init/initPrisma.js';

const router = express.Router();

// Génère un token JWT pour un utilisateur
const generateToken = (user) => {
	return jwt.sign(
		{ id: user.id, username: user.username },
		process.env.JWT_SECRET,
		{ expiresIn: '7d' } // le token expire après 7 jours
	);
};

// INSCRIPTION
router.post('/register', async (req, res) => {
	const { email, username, password } = req.body;

	if (!email || !username || !password) {
		return res.status(400).json({ error: 'Tous les champs sont requis.' });
	}
	if (password.length < 6) {
		return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
	}

	try {
		const existing = await prisma.users.findFirst({
			where: {
				OR: [{ email }, { username }]
			}
		});

		if (existing) {
			if (existing.email === email) {
				return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
			}
			return res.status(409).json({ error: 'Ce pseudo est déjà pris.' });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const newUser = await prisma.users.create({
			data: { email, username, passwordHash },
			select: {
				id: true,
				email: true,
				username: true,
				avatarUrl: true,
			}
		});

		// Génère un token pour connecter automatiquement l'utilisateur
		const token = generateToken(newUser);

		res.status(201).json({
			message: 'Compte créé avec succès !',
			token,
			user: newUser,
		});
	} catch (error) {
		console.error('Erreur inscription:', error);
		res.status(500).json({ error: 'Erreur lors de la création du compte.' });
	}
});

// CONNEXION
router.post('/login', async (req, res) => {
	const { identifier, password } = req.body; // identifier = email OU username

	if (!identifier || !password) {
		return res.status(400).json({ error: 'Email/pseudo et mot de passe requis.' });
	}

	try {
		// Cherche l'utilisateur par email OU username
		const user = await prisma.users.findFirst({
			where: {
				OR: [
					{ email: identifier },
					{ username: identifier },
				]
			}
		});

		if (!user) {
			return res.status(401).json({ error: 'Identifiants incorrects.' });
		}

		// Vérifie le mot de passe
		const valid = await bcrypt.compare(password, user.passwordHash);
		if (!valid) {
			return res.status(401).json({ error: 'Identifiants incorrects.' });
		}

		// Génère le token
		const token = generateToken(user);

		res.json({
			message: 'Connexion réussie !',
			token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				avatarUrl: user.avatarUrl,
			}
		});
	} catch (error) {
		console.error('Erreur connexion:', error);
		res.status(500).json({ error: 'Erreur lors de la connexion.' });
	}
});

export default router;