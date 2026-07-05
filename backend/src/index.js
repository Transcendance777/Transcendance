// bibliothèques et imports
import 'dotenv/config'; // parse les variables d'environnement
import express from 'express'; // framework web
import cors from 'cors'; // outil pour communiquer en sécurité avec un autre service

import session from 'express-session'; // gestion des sessions pour passport
import passport from 'passport'; // authentification OAuth
import './config/passport.js'; // configuration passport Google

import gamesRouter from './routes/games.js'; //routes internes
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import apiKeyRouter from './routes/apiKey.js';

import publicReviewsRouter from './routes/publicReviews.js'; //routes externes
import publicGamesRouter from './routes/publicGames.js';
import apiKeyAuth from './middlewares/apiKeyAuth.js';
import apiLimiter from './middlewares/rateLimiter.js';

import { syncDatabaseSchema, seedDatabase } from './init/initDatabase.js'; //fonctions DB

// port du back
const PORT = process.env.PORT_BACK || 4000;

//setup database
syncDatabaseSchema();
await seedDatabase();

//starting the app
const app = express(); //actual start
app.use(cors()); //apply this tool to the server
app.use(express.json({ limit: '5mb' }));//translates JSON files to JS directly

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

// ? API DOC
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// 1. Options de configuration de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Public API Documentation',
      version: '1.0.0',
      description: 'How to use Gamerev\'s public API',
    },
    servers: [
      {
        url: 'http://localhost:8443', // Modifie le port si nécessaire
      },
    ],
    // Configuration pour la clé API demandée par ton énoncé
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key', // Le nom du header que ton API attend
        },
      },
    },
  },
  // 2. Chemin vers les fichiers qui contiennent les routes à documenter
  apis: ['./src/routes/publicGames.js', './src/routes/publicReviews.js'],
};

// 3. Initialisation de swagger-jsdoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// 4. Création de la route pour la page de doc
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// ? API DOC

//infinite loop that listens to connections arriving on the backend port
app.listen(PORT, () => console.log(`Backend actif sur le port ${PORT}`));