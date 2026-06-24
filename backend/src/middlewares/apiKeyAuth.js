import prisma from '../init/initPrisma.js';

const apiKeyAuth = async (req, res, next) => {
  // 1. Lire la clé dans les headers
  const apiKey = req.headers['x-api-key'];

  // 2. Pas de clé du tout → on rejette immédiatement
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API key',
      hint: 'Add x-api-key header to your request'
    });
  }

  // 3. Chercher la clé en DB
  const keyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { user: true } // récupère aussi les infos du user lié
  });

  // 4. Clé introuvable en DB
  if (!keyRecord) {
    return res.status(401).json({ error: 'Wrong API key' });
  }

  // 5. Clé trouvée mais désactivée
  if (!keyRecord.isActive) {
    return res.status(403).json({ error: 'Deactivated API key' });
  }

  // 6. Tout est bon → on attache le user à req pour les controllers
  // Ainsi dans getAllReviews tu pourras faire req.user.id si besoin
  req.user = keyRecord.user;
  req.scope = keyRecord.scope;

  // 7. next() = "passe à la suite" (la route demandée)
  next();
};

export default apiKeyAuth;