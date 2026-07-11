import { FiMessageCircle, FiPlus } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { getAvatar, getOtherUser } from './chatUtils'

const formatTime = (date, locale) => {
	if (!date) return ''
	const parsed = new Date(date)
	const today = new Date()
	if (parsed.toDateString() === today.toDateString()) {
		return parsed.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
	}
	return parsed.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
}

const ConversationList = ({ conversations, currentUserId, selectedId, loading, onSelect, onCreate }) => {
	const { t, i18n } = useTranslation()

	return (
		<aside className="conversation-panel">
			<div className="conversation-panel-header">
				<div>
					<p className="conversation-eyebrow">{t('chat.inbox')}</p>
					<h2>{t('chat.conversations')}</h2>
				</div>
				<button className="chat-icon-btn" onClick={onCreate} aria-label={t('chat.new_conversation')} title={t('chat.new_conversation')}>
					<FiPlus />
				</button>
			</div>

			<div className="conversation-list">
				{loading && <p className="chat-muted-state">{t('chat.loading')}</p>}
				{!loading && conversations.length === 0 && (
					<div className="chat-empty-list">
						<FiMessageCircle />
						<p>{t('chat.no_conversations')}</p>
						<button onClick={onCreate}>{t('chat.start_conversation')}</button>
					</div>
				)}
				{conversations.map((conversation) => {
					const otherUser = getOtherUser(conversation, currentUserId)
					const active = Number(selectedId) === conversation.id
					return (
						<button
							key={conversation.id}
							className={`conversation-item ${active ? 'active' : ''}`}
							onClick={() => onSelect(conversation.id)}
						>
							<img src={getAvatar(otherUser)} alt="" className="conversation-avatar" />
							<span className="conversation-copy">
								<span className="conversation-topline">
									<strong>{otherUser?.username || t('chat.unknown_user')}</strong>
									<time>{formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt, i18n.language)}</time>
								</span>
								<span className="conversation-preview">{conversation.lastMessage?.body || t('chat.no_messages')}</span>
							</span>
							{conversation.unreadCount > 0 && <span className="conversation-unread">{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</span>}
						</button>
					)
				})}
			</div>
		</aside>
	)
}

export default ConversationList
