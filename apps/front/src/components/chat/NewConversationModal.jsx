import { useEffect, useState } from 'react'
import { FiMessageCircle, FiSearch, FiUserPlus, FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { getAvatar } from './chatUtils'
import { validateSearchQuery } from '../../utils/validation.js'

const NewConversationModal = ({ onClose, onSearch, onSelect, onAddFriend }) => {
	const { t } = useTranslation()
	const [query, setQuery] = useState('')
	const [results, setResults] = useState([])
	const [loading, setLoading] = useState(false)
	const [addingUserId, setAddingUserId] = useState(null)

	useEffect(() => {
		if (!query.trim()) return

		const queryResult = validateSearchQuery(query)
		if (!queryResult.ok) {
			setResults([])
			return
		}

		const timeout = setTimeout(async () => {
			setLoading(true)
			try {
				setResults(await onSearch(queryResult.value))
			} catch {
				setResults([])
			} finally {
				setLoading(false)
			}
		}, 300)

		return () => clearTimeout(timeout)
	}, [query, onSearch])

	const updateQuery = (event) => {
		const value = event.target.value
		setQuery(value)
		if (!value.trim()) setResults([])
	}

	const handleUserAction = async (user) => {
		if (user.isFriend) return onSelect(user)

		setAddingUserId(user.id)
		try {
			await onAddFriend(user)
			setResults(current => current.map(item => (
				item.id === user.id ? { ...item, isFriend: true } : item
			)))
		} catch {
			// The parent displays the API error in the chat alert.
		} finally {
			setAddingUserId(null)
		}
	}

	return (
		<div className="new-chat-overlay" onClick={onClose}>
			<div className="new-chat-modal" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="new-chat-title">
				<div className="new-chat-header">
					<div>
						<p>{t('chat.new_message')}</p>
						<h2 id="new-chat-title">{t('chat.find_user')}</h2>
					</div>
					<button onClick={onClose} aria-label={t('chat.close')}><FiX /></button>
				</div>
				<label className="new-chat-search">
					<FiSearch />
					<input value={query} onChange={updateQuery} placeholder={t('chat.search_user')} autoFocus />
				</label>
				<div className="new-chat-results">
					{loading && <p className="chat-muted-state">{t('chat.searching')}</p>}
					{!loading && query && results.length === 0 && <p className="chat-muted-state">{t('chat.no_users')}</p>}
					{results.map(user => (
						<button
							key={user.id}
							className={user.isFriend ? 'chat-user-friend' : 'chat-user-not-friend'}
							onClick={() => handleUserAction(user)}
							disabled={addingUserId === user.id}
							title={user.isFriend ? t('chat.message_friend') : t('chat.add_friend')}
						>
							<img src={getAvatar(user)} alt="" />
							<span>{user.username}</span>
							{user.isFriend ? <FiMessageCircle /> : <FiUserPlus />}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default NewConversationModal
