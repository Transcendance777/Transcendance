import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
	if (!socket) {
		socket = io({
			autoConnect: false,
			path: '/socket.io',
			transports: ['websocket', 'polling'],
		})
	}

	return socket
}

export const connectSocket = () => {
	const token = localStorage.getItem('token')
	if (!token) return null

	const activeSocket = getSocket()
	activeSocket.auth = { token }
	if (!activeSocket.connected) activeSocket.connect()
	return activeSocket
}

export const disconnectSocket = () => {
	if (!socket) return
	socket.removeAllListeners()
	socket.disconnect()
	socket = null
}
