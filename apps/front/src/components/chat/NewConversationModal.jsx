import { useEffect, useState } from 'react'
import { FiMessageCircle, FiSearch, FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { getAvatar } from './chatUtils'

const NewConversationModal = ({ onClose, onSearch, onSelect }) => {
	const { t } = useTranslation()
	const [query, setQuery] = useState('')
	const [results, setResults] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!query.trim()) return

		const timeout = setTimeout(async () => {
			setLoading(true)
			try {
				setResults(await onSearch(query.trim()))
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
						<button key={user.id} onClick={() => onSelect(user)}>
							<img src={getAvatar(user)} alt="" />
							<span>{user.username}</span>
							<FiMessageCircle />
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default NewConversationModal
