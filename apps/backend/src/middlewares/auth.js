import jwt from 'jsonwebtoken';
import { vaultSecrets } from '../init/initVault.js'; //secrets Vault

// Middleware qui vérifie le token JWT et identifie l'utilisateur
export const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Token manquant.' });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, vaultSecrets.JWT_SECRET);
		req.user = decoded; // { id, username }
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Token invalide ou expiré.' });
	}
};