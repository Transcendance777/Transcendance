import prisma from '../init/initPrisma.js';
import { areChatFriends } from '../services/chatFriendship.js';

const MAX_MESSAGE_LENGTH = 2000;
const MESSAGE_RATE_WINDOW_MS = 10_000;
const MESSAGE_RATE_LIMIT = 10;

const USER_SELECT = {
	id: true,
	username: true,
	avatarUrl: true,
};

const userRoom = userId => `user:${userId}`;
const conversationRoom = conversationId => `conversation:${conversationId}`;

const parseId = (value) => {
	const id = Number.parseInt(value, 10);
	return Number.isInteger(id) && id > 0 ? id : null;
};

const acknowledge = (callback, payload) => {
	if (typeof callback === 'function') callback(payload);
};

const rejectEvent = (callback, code, message) => {
	acknowledge(callback, { ok: false, error: { code, message } });
};

const getMembership = (conversationId, userId) => {
	return prisma.conversationParticipant.findUnique({
		where: {
			conversationId_userId: { conversationId, userId },
		},
		include: {
			conversation: {
				select: {
					participants: { select: { userId: true } },
				},
			},
		},
	});
};

const canUseDirectConversation = async (membership, userId) => {
	const otherParticipant = membership.conversation.participants.find(participant => participant.userId !== userId);
	return otherParticipant ? areChatFriends(userId, otherParticipant.userId) : false;
};

const emitToParticipants = (io, participantIds, event, payload) => {
	for (const userId of new Set(participantIds)) {
		io.to(userRoom(userId)).emit(event, payload);
	}
};

const canSendMessage = (socket) => {
	const now = Date.now();
	const recentMessages = (socket.data.messageTimestamps || []).filter(
		timestamp => now - timestamp < MESSAGE_RATE_WINDOW_MS
	);

	if (recentMessages.length >= MESSAGE_RATE_LIMIT) {
		socket.data.messageTimestamps = recentMessages;
		return false;
	}

	recentMessages.push(now);
	socket.data.messageTimestamps = recentMessages;
	return true;
};

const normalizeMessagePayload = (payload) => {
	const conversationId = parseId(payload?.conversationId);
	const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
	const clientId = typeof payload?.clientId === 'string' ? payload.clientId.slice(0, 100) : null;

	return { conversationId, body, clientId };
};

export const registerChatSocket = (io, socket) => {
	socket.on('conversation:join', async (payload, callback) => {
		const conversationId = parseId(payload?.conversationId);
		if (!conversationId) return rejectEvent(callback, 'INVALID_CONVERSATION', 'Invalid conversation id.');

		try {
			const membership = await getMembership(conversationId, socket.user.id);
			if (!membership) return rejectEvent(callback, 'FORBIDDEN', 'You are not a conversation participant.');
			if (!await canUseDirectConversation(membership, socket.user.id)) {
				return rejectEvent(callback, 'FRIENDS_ONLY', 'You can only message friends.');
			}

			await socket.join(conversationRoom(conversationId));
			return acknowledge(callback, { ok: true, conversationId });
		} catch (error) {
			console.error('Socket conversation:join error:', error);
			return rejectEvent(callback, 'SERVER_ERROR', 'Unable to join conversation.');
		}
	});

	socket.on('conversation:leave', async (payload, callback) => {
		const conversationId = parseId(payload?.conversationId);
		if (!conversationId) return rejectEvent(callback, 'INVALID_CONVERSATION', 'Invalid conversation id.');

		await socket.leave(conversationRoom(conversationId));
		return acknowledge(callback, { ok: true, conversationId });
	});

	socket.on('message:send', async (payload, callback) => {
		const { conversationId, body, clientId } = normalizeMessagePayload(payload);

		if (!conversationId) return rejectEvent(callback, 'INVALID_CONVERSATION', 'Invalid conversation id.');
		if (!body) return rejectEvent(callback, 'INVALID_MESSAGE', 'Message body is required.');
		if (body.length > MAX_MESSAGE_LENGTH) {
			return rejectEvent(callback, 'MESSAGE_TOO_LONG', `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
		}
		if (!canSendMessage(socket)) {
			return rejectEvent(callback, 'RATE_LIMITED', 'Too many messages. Please wait a moment.');
		}

		try {
			const membership = await getMembership(conversationId, socket.user.id);
			if (!membership) return rejectEvent(callback, 'FORBIDDEN', 'You are not a conversation participant.');
			if (!await canUseDirectConversation(membership, socket.user.id)) {
				return rejectEvent(callback, 'FRIENDS_ONLY', 'You can only message friends.');
			}

			const updatedAt = new Date();
			const [message] = await prisma.$transaction([
				prisma.chatMessage.create({
					data: {
						conversationId,
						senderId: socket.user.id,
						body,
					},
					include: { sender: { select: USER_SELECT } },
				}),
				prisma.conversation.update({
					where: { id: conversationId },
					data: { updatedAt },
				}),
			]);

			const participantIds = membership.conversation.participants.map(participant => participant.userId);
			const realtimeMessage = { ...message, clientId };
			const conversationUpdate = {
				conversationId,
				updatedAt,
				lastMessage: realtimeMessage,
			};

			emitToParticipants(io, participantIds, 'message:new', realtimeMessage);
			emitToParticipants(io, participantIds, 'conversation:updated', conversationUpdate);

			return acknowledge(callback, { ok: true, message: realtimeMessage });
		} catch (error) {
			console.error('Socket message:send error:', error);
			return rejectEvent(callback, 'SERVER_ERROR', 'Unable to send message.');
		}
	});

	socket.on('message:read', async (payload, callback) => {
		const conversationId = parseId(payload?.conversationId);
		if (!conversationId) return rejectEvent(callback, 'INVALID_CONVERSATION', 'Invalid conversation id.');

		try {
			const membership = await getMembership(conversationId, socket.user.id);
			if (!membership) return rejectEvent(callback, 'FORBIDDEN', 'You are not a conversation participant.');

			const lastReadAt = new Date();
			await prisma.conversationParticipant.update({
				where: {
					conversationId_userId: { conversationId, userId: socket.user.id },
				},
				data: { lastReadAt },
			});

			const readPayload = { conversationId, userId: socket.user.id, lastReadAt };
			const participantIds = membership.conversation.participants.map(participant => participant.userId);
			emitToParticipants(io, participantIds, 'message:read', readPayload);

			return acknowledge(callback, { ok: true, ...readPayload });
		} catch (error) {
			console.error('Socket message:read error:', error);
			return rejectEvent(callback, 'SERVER_ERROR', 'Unable to mark conversation as read.');
		}
	});

	for (const event of ['typing:start', 'typing:stop']) {
		socket.on(event, (payload, callback) => {
			const conversationId = parseId(payload?.conversationId);
			if (!conversationId) return rejectEvent(callback, 'INVALID_CONVERSATION', 'Invalid conversation id.');

			const room = conversationRoom(conversationId);
			if (!socket.rooms.has(room)) {
				return rejectEvent(callback, 'FORBIDDEN', 'Join the conversation before sending typing events.');
			}

			socket.to(room).emit(event, { conversationId, userId: socket.user.id });
			return acknowledge(callback, { ok: true, conversationId });
		});
	}
};

export { conversationRoom, userRoom };
