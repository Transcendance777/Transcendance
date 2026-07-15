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
        url: 'https://localhost:8443',
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

export default swaggerDocs;