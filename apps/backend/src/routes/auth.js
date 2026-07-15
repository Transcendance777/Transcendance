import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import prisma from '../init/initPrisma.js';
import nodemailer from 'nodemailer'
import { vaultSecrets } from '../init/initVault.js'; //secrets Vault
import {
	validateEmail,
	validateLoginIdentifier,
	validateCredentialPassword,
	validatePassword,
	validateResetCode,
	validateUsername,
} from '../middlewares/validationUtils.js';

const router = express.Router();

// Génère un token JWT pour un utilisateur
const generateToken = (user) => {
	return jwt.sign(
		{ id: user.id, username: user.username },
		vaultSecrets.JWT_SECRET,
		{ expiresIn: '7d' } // le token expire après 7 jours
	);
};

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: vaultSecrets.MAIL_USER,
		pass: vaultSecrets.MAIL_PASS
	}
})

// INSCRIPTION
router.post('/register', async (req, res) => {
	const { email, username, password } = req.body;

	if (email === undefined || username === undefined || password === undefined) {
		return res.status(400).json({ error: 'All fields are required.' });
	}

	const emailResult = validateEmail(email);
	if (!emailResult.ok) return res.status(400).json({ error: emailResult.error });

	const usernameResult = validateUsername(username);
	if (!usernameResult.ok) return res.status(400).json({ error: usernameResult.error });

	const passwordResult = validatePassword(password);
	if (!passwordResult.ok) return res.status(400).json({ error: passwordResult.error });

	const normalizedEmail = emailResult.value;
	const normalizedUsername = usernameResult.value;

	try {
		const existing = await prisma.users.findFirst({
			where: { OR: [{ email: normalizedEmail }, { username: normalizedUsername }] }
		});

		if (existing) {
			if (existing.email === normalizedEmail) {
				return res.status(409).json({ error: 'This email is already used.' });
			}
			return res.status(409).json({ error: 'This username is already taken.' });
		}

		const passwordHash = await bcrypt.hash(passwordResult.value, 10);

		const newUser = await prisma.users.create({
			data: { email: normalizedEmail, username: normalizedUsername, passwordHash },
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
	const { identifier, password } = req.body;

	const identifierResult = validateLoginIdentifier(identifier);
	if (!identifierResult.ok) return res.status(400).json({ error: identifierResult.error });

	const passwordResult = validateCredentialPassword(password, { requiredError: 'Email/username and password required.' });
	if (!passwordResult.ok) return res.status(400).json({ error: passwordResult.error });

	try {
		const user = await prisma.users.findFirst({
			where: {
				OR: [
					{ email: identifierResult.value },
					{ username: identifierResult.value },
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

		const valid = await bcrypt.compare(passwordResult.value, user.passwordHash);
		if (!valid) {
			return res.status(401).json({ error: 'Incorrect password.' });
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

// ─── MOT DE PASSE OUBLIÉ ───

router.post('/forgot-password', async (req, res) => {
	const { email } = req.body;

	const emailResult = validateEmail(email);
	if (!emailResult.ok) return res.status(400).json({ error: emailResult.error === 'All fields are required.' ? 'Email required.' : emailResult.error });

	try {
		const user = await prisma.users.findUnique({ where: { email: emailResult.value } })
		if (!user) return res.status(404).json({ error: 'No account found with this email.' })
		if (user.passwordHash === 'google_oauth') return res.status(400).json({ error: 'This account uses Google Sign-In.' })

		const code = Math.floor(100000 + Math.random() * 900000).toString()
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

		await prisma.passwordReset.create({
			data: { email: emailResult.value, code, expiresAt }
		})

		await transporter.sendMail({
			from: `"Game REV" <${process.env.MAIL_USER}>`,
			to: emailResult.value,
			subject: 'Password Reset - Game REV',
			html: `
				<div style="font-family: sans-serif; max-width: 400px; margin: auto;">
					<h2>Password Reset</h2>
					<p>Your verification code is:</p>
					<h1 style="letter-spacing: 8px; color: #f5a623;">${code}</h1>
					<p>This code expires in 15 minutes.</p>
				</div>
			`
		})

		res.json({ message: 'Code sent.' })
	} catch (error) {
		console.error('Erreur forgot-password:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

router.post('/verify-code', async (req, res) => {
	const { email, code } = req.body;

	const emailResult = validateEmail(email);
	if (!emailResult.ok) {
		return res.status(400).json({ error: emailResult.error === 'All fields are required.' ? 'Email and code required.' : emailResult.error });
	}

	const codeResult = validateResetCode(code);
	if (!codeResult.ok) return res.status(400).json({ error: codeResult.error });

	try {
		const reset = await prisma.passwordReset.findFirst({
			where: { email: emailResult.value, code: codeResult.value, used: false, expiresAt: { gt: new Date() } },
			orderBy: { createdAt: 'desc' }
		})

		if (!reset) return res.status(400).json({ error: 'Invalid or expired code.' })

		res.json({ message: 'Code verified.' })
	} catch (error) {
		console.error('Erreur verify-code:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

router.post('/reset-password', async (req, res) => {
	const { email, code, newPassword } = req.body;

	if (email === undefined || code === undefined || newPassword === undefined) {
		return res.status(400).json({ error: 'All fields required.' });
	}

	const emailResult = validateEmail(email);
	if (!emailResult.ok) return res.status(400).json({ error: emailResult.error });

	const codeResult = validateResetCode(code);
	if (!codeResult.ok) return res.status(400).json({ error: codeResult.error });

	const passwordResult = validatePassword(newPassword, { requiredError: 'All fields required.' });
	if (!passwordResult.ok) return res.status(400).json({ error: passwordResult.error });

	try {
		const reset = await prisma.passwordReset.findFirst({
			where: { email: emailResult.value, code: codeResult.value, used: false, expiresAt: { gt: new Date() } },
			orderBy: { createdAt: 'desc' }
		})

		if (!reset) return res.status(400).json({ error: 'Invalid or expired code.' })

		const hashed = await bcrypt.hash(passwordResult.value, 10)
		await prisma.users.update({ where: { email: emailResult.value }, data: { passwordHash: hashed } })
		await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } })

		res.json({ message: 'Password updated!' })
	} catch (error) {
		console.error('Erreur reset-password:', error)
		res.status(500).json({ error: 'Server error.' })
	}
})

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
	passport.authenticate('google', { failureRedirect: '/?error=email_conflict' }),
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