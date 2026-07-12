import { Server } from 'socket.io';
import { socketAuthMiddleware } from './authSocket.js';
import { registerChatSocket, userRoom } from './chatSocket.js';

const getAllowedOrigins = () => {
	const configuredOrigins = process.env.SOCKET_CORS_ORIGINS
		?.split(',')
		.map(origin => origin.trim())
		.filter(Boolean);

	return configuredOrigins?.length ? configuredOrigins : true;
};

export const initSocketServer = (httpServer) => {
	const io = new Server(httpServer, {
		cors: {
			origin: getAllowedOrigins(),
			methods: ['GET', 'POST'],
			credentials: true,
		},
		maxHttpBufferSize: 1_000_000,
	});

	io.use(socketAuthMiddleware);

	io.on('connection', async (socket) => {
		await socket.join(userRoom(socket.user.id));
		registerChatSocket(io, socket);
	});

	return io;
};
