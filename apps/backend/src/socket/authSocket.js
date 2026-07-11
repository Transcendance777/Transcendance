import jwt from 'jsonwebtoken';
import prisma from '../init/initPrisma.js';
import { vaultSecrets } from '../init/initVault.js';

const getHandshakeToken = (socket) => {
	const authToken = socket.handshake.auth?.token;
	if (typeof authToken === 'string' && authToken.trim()) return authToken.trim();

	const authorization = socket.handshake.headers?.authorization;
	if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
		return authorization.slice(7).trim();
	}

	return null;
};

const authenticationError = (code, message) => {
	const error = new Error(message);
	error.data = { code };
	return error;
};

export const socketAuthMiddleware = async (socket, next) => {
	const token = getHandshakeToken(socket);
	if (!token) return next(authenticationError('TOKEN_MISSING', 'Authentication token missing.'));

	try {
		const decoded = jwt.verify(token, vaultSecrets.JWT_SECRET);
		const userId = Number(decoded.id);

		if (!Number.isInteger(userId) || userId <= 0) {
			return next(authenticationError('TOKEN_INVALID', 'Invalid authentication token.'));
		}

		const user = await prisma.users.findUnique({
			where: { id: userId },
			select: { id: true, username: true },
		});

		if (!user) return next(authenticationError('USER_NOT_FOUND', 'Authenticated user no longer exists.'));

		socket.user = user;
		return next();
	} catch (error) {
		if (error?.data?.code) return next(error);
		return next(authenticationError('TOKEN_INVALID', 'Invalid or expired authentication token.'));
	}
};
