// bibliothèques et imports
import 'dotenv/config'; // parse les variables d'environnement
import express from 'express'; // framework web
import cors from 'cors'; // outil pour communiquer en sécurité avec un autre service
import session from 'express-session'; // gestion des sessions pour passport
import passport from 'passport'; // authentification OAuth
import { execSync } from 'child_process'; // pour la fonction execSync
import gamesRouter from './routes/games.js';
import prisma from './init/initPrisma.js'; // instance singleton de prisma
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import chatRouter from './routes/chat.js';
import './config/passport.js'; // configuration passport Google

// port
const PORT = process.env.PORT_BACK || 4000;

/**
 * Vérifie si le schéma DB a changé, si oui, met à jour la DB
 */
function syncDatabaseSchema() {
	console.log('🔄 Vérification des changements de schéma...');
	try {
		// execSync exécute la commande et bloque jusqu'à ce qu'elle réussisse
		execSync('npx prisma db push', { stdio: 'inherit' });
		console.log('✅ Schéma de la base de données à jour !');
	} catch (error) {
		console.error('❌ Échec de la synchronisation du schéma:', error);
		console.log('🔄 Réinitialisation de la base de données...');
		try {
			// Si le push normal échoue, force une réinitialisation propre de la DB
			execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
			console.log('✨ Base de données réinitialisée et schéma appliqué !');
		} catch (resetError) {
			console.error('❌ Échec critique de la mise à jour du schéma:', resetError);
			process.exit(1);
		}
	}
}

/**
 * Si la base de données est vide, la remplit avec quelques jeux
 * @returns rien
 */
async function seedDatabase() {
	console.log('🌱 Vérification du seeding de la base de données...');
	try {
		const gameCount = await prisma.game.count();
		if (gameCount > 0) {
			console.log(`La base de données contient déjà ${gameCount} jeux. Seed ignoré.`);
			return;
		}
		// Déclenche le mécanisme de seed de Prisma
		execSync('npx prisma db seed', { stdio: 'inherit' });
		console.log('✅ Seeding de la base de données terminé !');
	} catch (error) {
		console.error('❌ Échec du seeding:', error);
	}
}

syncDatabaseSchema();
await seedDatabase();

// connexion du client Prisma
prisma.$connect();

// démarrage de l'application
const app = express();
app.use(cors()); // applique CORS au serveur
app.use(express.json({ limit: '5mb' })); // traduit les JSON en JS directement

// Session nécessaire pour passport OAuth
app.use(session({
	secret: process.env.SESSION_SECRET || 'gamerev_secret',
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false }
}));

// Initialisation de passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);

// Route POST de test -> si des données sont reçues sur /api/login, voici le traitement :
app.post('/api/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		// Insertion de l'utilisateur en DB avec prisma (pour test de login, à supprimer plus tard)
		const newUser = await prisma.login_test.create({
			data: { email, password },
			select: { // retourne ces valeurs pour pouvoir les afficher
				id: true,
				email: true,
			}
		});
		console.log("INSERTION DB RÉUSSIE:", newUser);
		res.status(201).json({ message: "Utilisateur créé !", email: newUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur lors de l'insertion en base." });
	}
});

app.listen(PORT, () => console.log(`Backend actif sur le port ${PORT}`));
