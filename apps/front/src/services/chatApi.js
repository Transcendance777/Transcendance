const getToken = () => localStorage.getItem('token')

const chatRequest = async (path, options = {}) => {
	const token = getToken()
	if (!token) throw new Error('AUTH_REQUIRED')

	const response = await fetch(path, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...options.headers,
		},
	})

	const data = await response.json().catch(() => null)
	if (!response.ok) {
		const error = new Error(data?.error || 'CHAT_REQUEST_FAILED')
		error.status = response.status
		throw error
	}

	return data
}

export const getConversations = () => chatRequest('/api/chat/conversations')

export const getConversationMessages = conversationId => (
	chatRequest(`/api/chat/conversations/${conversationId}/messages`)
)

export const createDirectConversation = userId => (
	chatRequest(`/api/chat/conversations/direct/${userId}`, { method: 'POST' })
)

export const markConversationRead = conversationId => (
	chatRequest(`/api/chat/conversations/${conversationId}/read`, { method: 'POST' })
)

export const searchChatUsers = query => (
	chatRequest(`/api/user/search?q=${encodeURIComponent(query)}`)
)
