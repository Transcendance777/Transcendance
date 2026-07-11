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
	sentMessageVersion,
	onBack,
	onSend,
	onTypingStart,
	onTypingStop,
}) => {
	const { t, i18n } = useTranslation()
	const messageListRef = useRef(null)
	const initialScrollConversationRef = useRef(null)
	const shouldStickToBottomRef = useRef(true)
	const sentMessageVersionRef = useRef(sentMessageVersion)
	const otherUser = conversation ? getOtherUser(conversation, currentUserId) : null

	useEffect(() => {
		const messageList = messageListRef.current
		if (!messageList || loading || !conversation) return

		const isInitialScroll = initialScrollConversationRef.current !== conversation.id
		const sentMessageChanged = sentMessageVersionRef.current !== sentMessageVersion
		const distanceFromBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight

		if (sentMessageChanged) {
			shouldStickToBottomRef.current = true
			sentMessageVersionRef.current = sentMessageVersion
		}

		if (isInitialScroll || sentMessageChanged || shouldStickToBottomRef.current || distanceFromBottom < 160) {
			messageList.scrollTo({ top: messageList.scrollHeight, behavior: isInitialScroll ? 'auto' : 'smooth' })
			initialScrollConversationRef.current = conversation.id
		}
	}, [conversation, loading, messages, sentMessageVersion, typingUser])

	const handleMessageScroll = (event) => {
		const messageList = event.currentTarget
		const distanceFromBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight
		shouldStickToBottomRef.current = distanceFromBottom < 80
	}

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

			<div className="message-list" ref={messageListRef} onScroll={handleMessageScroll}>
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
