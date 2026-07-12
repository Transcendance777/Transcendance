import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// limite le nombre de requêtes pour l'API -> middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 100,                  // max 100 requêtes par fenêtre
  standardHeaders: true,     // renvoie les headers RateLimit-* (RFC 6585)
  legacyHeaders: false,      // désactive les headers X-RateLimit-* (dépréciés)
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || ipKeyGenerator(req.ip); // fallback IP sécurisé IPv6
  },
  validate: { xForwardedForHeader: false, trustProxy: false },
  message: {
    status: 429,
    error: 'Too many requests. Try again in 15 minutes.'
  }
});

export default apiLimiter;
