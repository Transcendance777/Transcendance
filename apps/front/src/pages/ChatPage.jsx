import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Background from '../components/Background'
import ChatNavBar from '../components/chat/ChatNavBar'
import ConversationList from '../components/chat/ConversationList'
import ChatWindow from '../components/chat/ChatWindow'
import NewConversationModal from '../components/chat/NewConversationModal'
import {
	createDirectConversation,
	getConversationMessages,
	getConversations,
	markConversationRead,
	searchChatUsers,
} from '../services/chatApi'
import { connectSocket, getSocket } from '../services/socket'
import '../styles/ChatPage.css'

const getStoredUser = () => {
	try {
		return JSON.parse(localStorage.getItem('user') || '{}')
	} catch {
		return {}
	}
}

const upsertConversation = (items, conversation) => {
	const next = [conversation, ...items.filter(item => item.id !== conversation.id)]
	return next.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

const ChatPage = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { conversationId } = useParams()
	const [currentUser] = useState(getStoredUser)
	const currentUserId = Number(currentUser.id)
	const selectedId = Number(conversationId) || null
	const selectedIdRef = useRef(selectedId)
	const conversationsRef = useRef([])
	const typingTimeoutRef = useRef(null)
	const hasToken = Boolean(localStorage.getItem('token'))
	const [conversations, setConversations] = useState([])
	const [messages, setMessages] = useState([])
	const [loadingConversations, setLoadingConversations] = useState(hasToken)
	const [loadingMessages, setLoadingMessages] = useState(Boolean(selectedId))
	const [connectionState, setConnectionState] = useState(hasToken ? 'connecting' : 'disconnected')
	const [typingUser, setTypingUser] = useState('')
	const [error, setError] = useState(() => hasToken ? '' : t('chat.auth_required'))
	const [newConversationOpen, setNewConversationOpen] = useState(false)

	const selectedConversation = conversations.find(item => item.id === selectedId) || null

	useEffect(() => {
		conversationsRef.current = conversations
	}, [conversations])

	useEffect(() => {
		selectedIdRef.current = selectedId
	}, [selectedId])

	useEffect(() => {
		if (!hasToken) return

		getConversations()
			.then(data => setConversations(Array.isArray(data) ? data : []))
			.catch(() => setError(t('chat.load_error')))
			.finally(() => setLoadingConversations(false))
	}, [hasToken, t])

	useEffect(() => {
		const socket = connectSocket()
		if (!socket) return

		const handleConnect = () => setConnectionState('connected')
		const handleDisconnect = () => setConnectionState('disconnected')
		const handleConnectError = () => setConnectionState('disconnected')
		const handleNewMessage = (message) => {
			if (message.conversationId === selectedIdRef.current) {
				setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message])
				getSocket().emit('message:read', { conversationId: message.conversationId })
			}
			if (!conversationsRef.current.some(conversation => conversation.id === message.conversationId)) {
				getConversations().then(data => setConversations(Array.isArray(data) ? data : [])).catch(() => {})
				return
			}
			setConversations(current => current.map(conversation => (
				conversation.id === message.conversationId
					? {
						...conversation,
						lastMessage: message,
						updatedAt: message.createdAt,
						unreadCount: message.conversationId === selectedIdRef.current || message.senderId === currentUserId
							? 0
							: (conversation.unreadCount || 0) + 1,
					}
					: conversation
			)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
		}
		const handleConversationUpdate = ({ conversationId: updatedId, updatedAt, lastMessage }) => {
			if (!conversationsRef.current.some(conversation => conversation.id === updatedId)) {
				getConversations().then(data => setConversations(Array.isArray(data) ? data : [])).catch(() => {})
				return
			}
			setConversations(current => current.map(conversation => (
				conversation.id === updatedId ? { ...conversation, updatedAt, lastMessage } : conversation
			)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
		}
		const handleTypingStart = ({ conversationId: typingConversationId, userId }) => {
			if (typingConversationId !== selectedIdRef.current || userId === currentUserId) return
			const conversation = conversationsRef.current.find(item => item.id === typingConversationId)
			const participant = conversation?.participants?.find(item => item.userId === userId)
			setTypingUser(participant?.user?.username || t('chat.someone'))
		}
		const handleTypingStop = ({ conversationId: typingConversationId }) => {
			if (typingConversationId === selectedIdRef.current) setTypingUser('')
		}

		socket.on('connect', handleConnect)
		socket.on('disconnect', handleDisconnect)
		socket.on('connect_error', handleConnectError)
		socket.on('message:new', handleNewMessage)
		socket.on('conversation:updated', handleConversationUpdate)
		socket.on('typing:start', handleTypingStart)
		socket.on('typing:stop', handleTypingStop)
		if (socket.connected) handleConnect()

		return () => {
			socket.off('connect', handleConnect)
			socket.off('disconnect', handleDisconnect)
			socket.off('connect_error', handleConnectError)
			socket.off('message:new', handleNewMessage)
			socket.off('conversation:updated', handleConversationUpdate)
			socket.off('typing:start', handleTypingStart)
			socket.off('typing:stop', handleTypingStop)
		}
	}, [currentUserId, t])

	useEffect(() => {
		if (!selectedId) return

		const socket = getSocket()
		socket.emit('conversation:join', { conversationId: selectedId })
		getConversationMessages(selectedId)
			.then(data => {
				setMessages(Array.isArray(data) ? data : [])
				setConversations(current => current.map(conversation => (
					conversation.id === selectedId ? { ...conversation, unreadCount: 0 } : conversation
				)))
				if (socket.connected) {
					socket.emit('message:read', { conversationId: selectedId })
					return null
				}
				return markConversationRead(selectedId)
			})
			.catch(() => setError(t('chat.messages_error')))
			.finally(() => setLoadingMessages(false))

		return () => socket.emit('conversation:leave', { conversationId: selectedId })
	}, [selectedId, t])

	useEffect(() => () => clearTimeout(typingTimeoutRef.current), [])

	const handleSelectConversation = id => {
		setLoadingMessages(true)
		setTypingUser('')
		navigate(`/chat/${id}`)
	}
	const handleBack = () => {
		setMessages([])
		setLoadingMessages(false)
		setTypingUser('')
		navigate('/chat')
	}
	const handleSearch = useCallback(query => searchChatUsers(query), [])

	const handleCreateConversation = async (user) => {
		try {
			const conversation = await createDirectConversation(user.id)
			setConversations(current => upsertConversation(current, conversation))
			setNewConversationOpen(false)
			setLoadingMessages(true)
			navigate(`/chat/${conversation.id}`)
		} catch {
			setError(t('chat.create_error'))
		}
	}

	const handleSend = body => new Promise(resolve => {
		if (!selectedId) return resolve(false)
		const clientId = crypto.randomUUID()
		getSocket().emit('message:send', { conversationId: selectedId, body, clientId }, response => {
			if (!response?.ok) {
				setError(response?.error?.message || t('chat.send_error'))
				return resolve(false)
			}
			resolve(true)
		})
	})

	const handleTypingStart = () => {
		if (!selectedId) return
		const socket = getSocket()
		socket.emit('typing:start', { conversationId: selectedId })
		clearTimeout(typingTimeoutRef.current)
		typingTimeoutRef.current = setTimeout(() => {
			socket.emit('typing:stop', { conversationId: selectedId })
		}, 1200)
	}

	const handleTypingStop = () => {
		if (!selectedId) return
		clearTimeout(typingTimeoutRef.current)
		getSocket().emit('typing:stop', { conversationId: selectedId })
	}

	return (
		<div className="chat-page">
			<ChatNavBar />
			<Background style={{ alignItems: 'flex-start' }}>
				<main className="chat-content">
					{error && (
						<div className="chat-error" role="alert">
							<span>{error}</span>
							<button onClick={() => setError('')} aria-label={t('chat.close')}>×</button>
						</div>
					)}
					<div className={`chat-shell ${selectedId ? 'has-conversation' : ''}`}>
						<ConversationList
							conversations={conversations}
							currentUserId={currentUserId}
							selectedId={selectedId}
							loading={loadingConversations}
							onSelect={handleSelectConversation}
							onCreate={() => setNewConversationOpen(true)}
						/>
						<ChatWindow
							conversation={selectedConversation}
							currentUserId={currentUserId}
							messages={messages}
							loading={loadingMessages}
							connectionState={connectionState}
							typingUser={typingUser}
							onBack={handleBack}
							onSend={handleSend}
							onTypingStart={handleTypingStart}
							onTypingStop={handleTypingStop}
						/>
					</div>
				</main>
			</Background>
			{newConversationOpen && (
				<NewConversationModal
					onClose={() => setNewConversationOpen(false)}
					onSearch={handleSearch}
					onSelect={handleCreateConversation}
				/>
			)}
		</div>
	)
}

export default ChatPage
