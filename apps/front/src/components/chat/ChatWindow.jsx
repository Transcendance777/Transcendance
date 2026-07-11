import { useEffect, useRef } from 'react'
import { FiArrowLeft, FiMessageCircle, FiWifiOff } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'
import { getAvatar, getOtherUser } from './chatUtils'

const ChatWindow = ({
	conversation,
	currentUserId,
	messages,
	loading,
	connectionState,
	typingUser,
	onBack,
	onSend,
	onTypingStart,
	onTypingStop,
}) => {
	const { t, i18n } = useTranslation()
	const bottomRef = useRef(null)
	const otherUser = conversation ? getOtherUser(conversation, currentUserId) : null

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, typingUser])

	if (!conversation) {
		return (
			<section className="chat-window chat-window-empty">
				<FiMessageCircle />
				<h2>{t('chat.select_conversation')}</h2>
				<p>{t('chat.select_conversation_desc')}</p>
			</section>
		)
	}

	return (
		<section className="chat-window">
			<header className="chat-window-header">
				<button className="chat-back-btn" onClick={onBack} aria-label={t('chat.back')}>
					<FiArrowLeft />
				</button>
				<img src={getAvatar(otherUser)} alt="" />
				<div>
					<h2>{otherUser?.username || t('chat.unknown_user')}</h2>
					<p className={`socket-state ${connectionState}`}>
						{connectionState === 'connected' ? t('chat.live') : t('chat.reconnecting')}
					</p>
				</div>
				{connectionState !== 'connected' && <FiWifiOff className="socket-offline-icon" />}
			</header>

			<div className="message-list">
				{loading && <p className="chat-muted-state">{t('chat.loading_messages')}</p>}
				{!loading && messages.length === 0 && <p className="chat-muted-state">{t('chat.first_message')}</p>}
				{messages.map(message => (
					<MessageBubble
						key={message.id || message.clientId}
						message={message}
						own={message.senderId === currentUserId}
						locale={i18n.language}
					/>
				))}
				{typingUser && <p className="typing-indicator">{t('chat.typing', { username: typingUser })}</p>}
				<div ref={bottomRef} />
			</div>

			<MessageComposer
				onSend={onSend}
				onTypingStart={onTypingStart}
				onTypingStop={onTypingStop}
				disabled={connectionState !== 'connected'}
			/>
		</section>
	)
}

export default ChatWindow
