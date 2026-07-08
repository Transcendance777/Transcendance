import prisma from '../init/initPrisma.js';
import crypto from 'crypto';

const generatePlainKey = () => `pk_${crypto.randomBytes(32).toString('hex')}`;

const hashToken = (token) =>
	crypto.createHash('sha256').update(token).digest('hex');

// POST /api/api-key/generate
const generateApiKey = async (req, res) => {
	try {
		const userId = Number(req.user.id);
		const plainKey = generatePlainKey();
		const hashedKey = hashToken(plainKey);

		await prisma.apiKey.upsert({
			where: { userId },
			update: {
				key: hashedKey,
				isActive: true,
				scope: 'regular',
			},
			create: {
				key: hashedKey,
				isActive: true,
				userId,
			},
		});

		res.status(201).json({
			apiKey: plainKey,
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
		const userId = Number(req.user.id);

		const existingKey = await prisma.apiKey.findUnique({
			where: { userId },
		});

		if (!existingKey) {
			return res.status(404).json({ error: 'No API key found for this user' });
		}

		await prisma.apiKey.update({
			where: { userId },
			data: { isActive: false },
		});

		res.json({ message: 'Key revoked successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Error revoking key' });
	}
};

export default { generateApiKey, revokeApiKey };
