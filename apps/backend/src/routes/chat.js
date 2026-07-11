import express from 'express';
import prisma from '../init/initPrisma.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

const USER_SELECT = {
	id: true,
	username: true,
	avatarUrl: true,
};

const MESSAGE_INCLUDE = {
	sender: { select: USER_SELECT },
};

const getDirectKey = (userIdA, userIdB) => {
	const [firstId, secondId] = [userIdA, userIdB].sort((a, b) => a - b);
	return `${firstId}:${secondId}`;
};

const parseId = (value) => {
	const id = Number.parseInt(value, 10);
	return Number.isInteger(id) && id > 0 ? id : null;
};

const findParticipant = (conversationId, userId) => {
	return prisma.conversationParticipant.findUnique({
		where: {
			conversationId_userId: { conversationId, userId },
		},
	});
};

const getConversationPayload = async (conversationId, currentUserId) => {
	const conversation = await prisma.conversation.findUnique({
		where: { id: conversationId },
		include: {
			participants: {
				include: { user: { select: USER_SELECT } },
				orderBy: { joinedAt: 'asc' },
			},
			messages: {
				include: MESSAGE_INCLUDE,
				orderBy: { createdAt: 'desc' },
				take: 1,
			},
		},
	});

	if (!conversation) return null;

	const currentParticipant = conversation.participants.find(p => p.userId === currentUserId);
	const unreadWhere = {
		conversationId,
		senderId: { not: currentUserId },
		...(currentParticipant?.lastReadAt ? { createdAt: { gt: currentParticipant.lastReadAt } } : {}),
	};
	const unreadCount = await prisma.chatMessage.count({ where: unreadWhere });

	return {
		id: conversation.id,
		type: conversation.type,
		directKey: conversation.directKey,
		createdAt: conversation.createdAt,
		updatedAt: conversation.updatedAt,
		participants: conversation.participants.map(participant => ({
			userId: participant.userId,
			joinedAt: participant.joinedAt,
			lastReadAt: participant.lastReadAt,
			user: participant.user,
		})),
		lastMessage: conversation.messages[0] || null,
		unreadCount,
	};
};

// Liste les conversations de l'utilisateur connecte.
router.get('/conversations', authMiddleware, async (req, res) => {
	try {
		const participations = await prisma.conversationParticipant.findMany({
			where: { userId: req.user.id },
			include: {
				conversation: {
					select: { id: true, updatedAt: true },
				},
			},
			orderBy: { conversation: { updatedAt: 'desc' } },
		});

		const conversations = await Promise.all(
			participations.map(participation => getConversationPayload(participation.conversation.id, req.user.id))
		);

		res.json(conversations.filter(Boolean));
	} catch (error) {
		console.error('Erreur get conversations:', error);
		res.status(500).json({ error: 'Server error.' });
	}
});

// Cree ou recupere une conversation directe avec un autre utilisateur.
router.post('/conversations/direct/:userId', authMiddleware, async (req, res) => {
	const targetId = parseId(req.params.userId);

	if (!targetId) return res.status(400).json({ error: 'Invalid user id.' });
	if (targetId === req.user.id) return res.status(400).json({ error: 'You cannot create a conversation with yourself.' });

	try {
		const targetUser = await prisma.users.findUnique({
			where: { id: targetId },
			select: USER_SELECT,
		});
		if (!targetUser) return res.status(404).json({ error: 'User not found.' });

		const directKey = getDirectKey(req.user.id, targetId);
		let conversation = await prisma.conversation.findUnique({
			where: { directKey },
			select: { id: true },
		});

		if (!conversation) {
			conversation = await prisma.conversation.create({
				data: {
					type: 'direct',
					directKey,
					participants: {
						create: [
							{ userId: req.user.id },
							{ userId: targetId },
						],
					},
				},
				select: { id: true },
			});
		}

		const payload = await getConversationPayload(conversation.id, req.user.id);
		res.status(201).json(payload);
	} catch (error) {
		console.error('Erreur create direct conversation:', error);
		res.status(500).json({ error: 'Server error.' });
	}
});

// Recupere les messages d'une conversation accessible.
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
	const conversationId = parseId(req.params.id);
	if (!conversationId) return res.status(400).json({ error: 'Invalid conversation id.' });

	try {
		const participant = await findParticipant(conversationId, req.user.id);
		if (!participant) return res.status(403).json({ error: 'Unauthorized.' });

		const messages = await prisma.chatMessage.findMany({
			where: { conversationId },
			include: MESSAGE_INCLUDE,
			orderBy: { createdAt: 'asc' },
		});

		res.json(messages);
	} catch (error) {
		console.error('Erreur get messages:', error);
		res.status(500).json({ error: 'Server error.' });
	}
});

// Marque une conversation comme lue pour l'utilisateur connecte.
router.post('/conversations/:id/read', authMiddleware, async (req, res) => {
	const conversationId = parseId(req.params.id);
	if (!conversationId) return res.status(400).json({ error: 'Invalid conversation id.' });

	try {
		const participant = await findParticipant(conversationId, req.user.id);
		if (!participant) return res.status(403).json({ error: 'Unauthorized.' });

		const updated = await prisma.conversationParticipant.update({
			where: {
				conversationId_userId: { conversationId, userId: req.user.id },
			},
			data: { lastReadAt: new Date() },
			select: { conversationId: true, userId: true, lastReadAt: true },
		});

		res.json(updated);
	} catch (error) {
		console.error('Erreur mark conversation read:', error);
		res.status(500).json({ error: 'Server error.' });
	}
});

export default router;
