import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiSearch } from 'react-icons/fi'
import '../styles/SearchBar.css'

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const SearchBar = () => {
	const { t } = useTranslation()
	const [searchOpen, setSearchOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [gameResults, setGameResults] = useState([])
	const [userResults, setUserResults] = useState([])
	const navigate = useNavigate()
	const containerRef = useRef(null)

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setSearchOpen(false)
				setSearch('')
				setGameResults([])
				setUserResults([])
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		if (search.trim() === '') {
			setGameResults([])
			setUserResults([])
			return
		}

		const timeout = setTimeout(async () => {
			try {
				const token = localStorage.getItem('token')
				const headers = token ? { Authorization: `Bearer ${token}` } : {}

				const [gameRes, userRes] = await Promise.all([
					fetch(`/api/games/search?q=${encodeURIComponent(search)}`),
					fetch(`/api/user/search?q=${encodeURIComponent(search)}`, { headers })
				])

				const gameData = await gameRes.json()
				const userData = userRes.ok ? await userRes.json() : []

				setGameResults(gameData.slice(0, 50).map(g => ({
					id: g.idExterne || g.id,
					title: g.title || g.name,
					image: g.coverImageUrl ||
						(g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : "https://placehold.co/40x55")
				})))

				setUserResults(userData.slice(0, 10))
			} catch (err) {
				console.error('Erreur recherche:', err)
			}
		}, 300)

		return () => clearTimeout(timeout)
	}, [search])

	const handleSelectGame = (id) => {
		setSearch('')
		setGameResults([])
		setUserResults([])
		setSearchOpen(false)
		navigate(`/game/${id}`)
	}

	const handleSelectUser = (id) => {
		setSearch('')
		setGameResults([])
		setUserResults([])
		setSearchOpen(false)
		navigate(`/profile/${id}`)
	}

	const hasResults = gameResults.length > 0 || userResults.length > 0

	return (
		<div className="search-container" ref={containerRef}>
			<button className="search-icon" onClick={() => setSearchOpen(!searchOpen)}>
				<FiSearch />
			</button>
			{searchOpen && (
				<input
					className="search-input"
					type="text"
					placeholder={t('search.placeholder')}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					autoFocus
				/>
			)}
			{searchOpen && hasResults && (
				<div className="search-results">
					{userResults.length > 0 && (
						<>
							<p className="search-results-label">{t('search.users')}</p>
							{userResults.map((user) => (
								<div key={user.id} className="search-result-item" onClick={() => handleSelectUser(user.id)}>
									<img src={getAvatar(user.avatarUrl, user.username)} alt={user.username} className="search-result-avatar" />
									<span className="search-result-title">{user.username}</span>
								</div>
							))}
						</>
					)}
					{gameResults.length > 0 && (
						<>
							<p className="search-results-label">{t('search.games')}</p>
							{gameResults.map((game, i) => (
								<div key={i} className="search-result-item" onClick={() => handleSelectGame(game.id)}>
									<img src={game.image} alt={game.title} className="search-result-img" />
									<span className="search-result-title">{game.title}</span>
								</div>
							))}
						</>
					)}
				</div>
			)}
		</div>
	)
}

export default SearchBar