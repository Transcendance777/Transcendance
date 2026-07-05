import prisma from '../init/initPrisma.js';
import crypto from 'crypto';

// Token clair généré UNE seule fois, jamais stocké
const generateToken = () => 'pk_' + crypto.randomBytes(32).toString('hex');

// Hash SHA-256 — ce qui va en base
const hashToken = (token) =>
crypto.createHash('sha256').update(token).digest('hex');

// POST /api/api-key/generate
const generateApiKey = async (req, res) => {
	try {
		const plainKey = generateToken();   // pk_a3f9...  → affiché UNE fois
		const hashedKey = hashToken(plainKey); // sha256   → stocké en base

		await prisma.apiKey.create({
			data: {
			userId: req.user.id,
			key: hashedKey,
			isActive: true
			}
	  });

		res.status(201).json({
			apiKey: plainKey, // ← seul moment où la clé claire est exposée
			message: 'Copy this key now. It will not be displayed again.',
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Error generating key' });
	}
};

// DELETE /api/api-key/revoke
const revokeApiKey = async (req, res) => {
	try {
	  await prisma.apiKey.update({
		where: { userId: req.user.id },
		isActive: false
	  });
  
	  res.json({ message: 'Key revoked successfully' });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ error: 'Error revoking key' });
	}
  };

  export default { generateApiKey, revokeApiKey };