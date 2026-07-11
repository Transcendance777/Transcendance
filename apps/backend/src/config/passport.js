import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../init/initPrisma.js';
import { vaultSecrets } from '../init/initVault.js'; //secrets Vault

passport.use(new GoogleStrategy({
	clientID: vaultSecrets.GOOGLE_CLIENT_ID,
	clientSecret: vaultSecrets.GOOGLE_CLIENT_SECRET,
	callbackURL: 'https://localhost:8443/api/auth/google/callback',
	proxy: true
}, async (accessToken, refreshToken, profile, done) => {
	try {
		const email = profile.emails[0].value

		// Cherche l'user par email
		let user = await prisma.users.findUnique({ where: { email } })

		if (!user) {
			// Génère un username unique depuis le nom Google
			let username = profile.displayName.replace(/\s+/g, '_')
			const existingUsername = await prisma.users.findUnique({ where: { username } })
			if (existingUsername) {
				username = `${username}_${Date.now()}`
			}

			user = await prisma.users.create({
				data: {
					email,
					username,
					passwordHash: 'google_oauth',
					avatarUrl: 'default_avatar.png'
				}
			})
		} else if (user.passwordHash !== 'google_oauth') {
			// L'email existe déjà avec un compte classique → on bloque
			return done(null, false, { message: 'email_conflict' })
		} else if (user.avatarUrl && user.avatarUrl.startsWith('data:')) {
			// Si l'avatarUrl en DB est un base64 → on le remet à default
			user = await prisma.users.update({
				where: { id: user.id },
				data: { avatarUrl: 'default_avatar.png' }
			})
		}

		return done(null, user)
	} catch (error) {
		return done(error, null)
	}
}))

// Sérialise l'user en session (stocke juste l'id)
passport.serializeUser((user, done) => done(null, user.id))

// Désérialise l'user depuis la session (récupère l'user complet)
passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.users.findUnique({ where: { id } })
		done(null, user)
	} catch (err) {
		done(err, null)
	}
})