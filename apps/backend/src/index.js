// bibliothèques et imports
import 'dotenv/config'; // parse les variables d'environnement
import express from 'express'; // framework web
import cors from 'cors'; // outil pour communiquer en sécurité avec un autre service

import session from 'express-session'; // gestion des sessions pour passport
import passport from 'passport'; // authentification OAuth
import './config/passport.js'; // configuration passport Google
import register, { metricsMiddleware } from './metrics.js';

import gamesRouter from './routes/games.js'; //routes internes
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import apiKeyRouter from './routes/apiKey.js';

import publicReviewsRouter from './routes/publicReviews.js'; //routes externes
import publicGamesRouter from './routes/publicGames.js';
import apiKeyAuth from './middlewares/apiKeyAuth.js';
import apiLimiter from './middlewares/rateLimiter.js';
import swaggerUi from 'swagger-ui-express'; //swagger
import swaggerDocs from './tools/swagger.js'; 

import { syncDatabaseSchema, seedDatabase, ensureVaultDbRole } from './init/initDatabase.js'; //fonctions DB

// port du back
const PORT = process.env.PORT_BACK || 4000;

//setup database
syncDatabaseSchema();
await ensureVaultDbRole();
await seedDatabase();

// démarrage de l'application
const app = express();
app.use(cors()); // applique CORS au serveur
app.use(express.json({ limit: '5mb' })); // traduit les JSON en JS directement


app.use(metricsMiddleware); // observe chaque requête pour Prometheus
// Métriques pour Prometheus (accès interne uniquement, non exposé via nginx)
app.get('/metrics', async (req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(await register.metrics());
});

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

// Internal API routes
app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/api-key', apiKeyRouter);

// Public API routes
app.use('/api/public/games', apiLimiter, apiKeyAuth, publicGamesRouter);
app.use('/api/public/reviews', apiLimiter, apiKeyAuth, publicReviewsRouter);

// Page /api-docs for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


//infinite loop that listens to connections arriving on the backend port
app.listen(PORT, () => console.log(`Backend actif sur le port ${PORT}`));