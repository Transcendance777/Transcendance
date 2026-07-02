import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
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
		return res.status(400).json({ error: 'All fields are required.' });
	}
	if (password.length < 6) {
		return res.status(400).json({ error: 'Password must be at least 6 characters.' });
	}

	try {
		const existing = await prisma.users.findFirst({
			where: { OR: [{ email }, { username }] }
		});

		if (existing) {
			if (existing.email === email) {
				return res.status(409).json({ error: 'This email is already used.' });
			}
			return res.status(409).json({ error: 'This username is already taken.' });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const newUser = await prisma.users.create({
			data: { email, username, passwordHash },
			select: { id: true, email: true, username: true, avatarUrl: true }
		});

		// Génère un token pour connecter automatiquement l'utilisateur
		const token = generateToken(newUser);

		res.status(201).json({ message: 'Account created!', token, user: newUser });
	} catch (error) {
		console.error('Erreur inscription:', error);
		res.status(500).json({ error: 'Error creating account.' });
	}
});

// CONNEXION
router.post('/login', async (req, res) => {
	const { identifier, password } = req.body; // identifier = email OU username

	if (!identifier || !password) {
		return res.status(400).json({ error: 'Email/username and password required.' });
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
			return res.status(401).json({ error: 'Incorrect credentials.' });
		}

		// Vérifie le mot de passe — bloque la connexion Google OAuth via login normal
		if (user.passwordHash === 'google_oauth') {
			return res.status(401).json({ error: 'This account uses Google Sign-In.' });
		}

		const valid = await bcrypt.compare(password, user.passwordHash);
		if (!valid) {
			return res.status(401).json({ error: 'Incorrect credentials.' });
		}

		// Génère le token
		const token = generateToken(user);

		res.json({
			message: 'Login successful!',
			token,
			user: { id: user.id, email: user.email, username: user.username, avatarUrl: user.avatarUrl }
		});
	} catch (error) {
		console.error('Erreur connexion:', error);
		res.status(500).json({ error: 'Error during login.' });
	}
});

// ─── GOOGLE OAUTH ───

// Redirige vers Google pour l'authentification
router.get('/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		prompt: 'select_account' // force le choix du compte à chaque fois
	})
)

// Callback après authentification Google
router.get('/google/callback',
	(req, res, next) => {
		console.log('Google callback reçu')
		next()
	},
	passport.authenticate('google', { failureRedirect: '/?error=google' }),
	(req, res) => {
		console.log('User authentifié:', req.user)
		// Génère un JWT comme pour le login normal
		const token = generateToken(req.user)

		const user = {
			id: req.user.id,
			username: req.user.username,
			email: req.user.email,
			avatarUrl: req.user.avatarUrl,
			isGoogle: true
		}

		// Redirige vers le front avec le token dans l'URL
		res.redirect(`https://localhost:8443/home?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`)
	}
)

export default router;