import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiPlus, FiX } from 'react-icons/fi'
import '../styles/ProfileFavorites.css'
import { validateSearchQuery } from '../utils/validation.js'

const MAX_FAVORITES = 4

const ProfileFavorites = ({ editable = false, externalFavorites = null }) => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const [favorites, setFavorites] = useState([])
	const [showModal, setShowModal] = useState(false)
	const [search, setSearch] = useState('')
	const [results, setResults] = useState([])
	const [searchMsg, setSearchMsg] = useState('')
	const [isTouchDevice, setIsTouchDevice] = useState(false)
	const displayFavorites = externalFavorites !== null ? externalFavorites : favorites
	const [addMsg, setAddMsg] = useState('')

	useEffect(() => {
		setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
	}, [])

	useEffect(() => {
		if (externalFavorites !== null) return
		const token = localStorage.getItem('token')
		if (!token) return
		fetch('/api/user/favorites', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.ok ? res.json() : [])
			.then(data => setFavorites(data))
			.catch(err => console.error('Erreur favorites:', err))
	}, [externalFavorites])

	const handleSearch = async (value) => {
		setSearch(value)
		setSearchMsg('')
		if (value.trim() === '') return setResults([])
		const queryResult = validateSearchQuery(value)
		if (!queryResult.ok) {
			setSearchMsg(t(queryResult.errorKey))
			return setResults([])
		}
		try {
			const res = await fetch(`/api/games/search?q=${encodeURIComponent(queryResult.value)}`)
			if (!res.ok) return setResults([])  // ← avant res.json()
			const data = await res.json()
			const formatted = data
				.filter(g => g.id || g.idExterne)
				.map(g => ({
					id: g.idExterne || g.id?.toString(),
					title: g.title || g.name,
					cover: g.coverImageUrl || (g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : null)
				}))
				.filter(g => g.cover)
			setResults(formatted.slice(0, 8))
			setSearchMsg(formatted.length === 0 ? t('friends.no_user') : '')
		} catch (err) {
			console.error('Erreur search:', err)
		}
	}

	const handleAddFavorite = async (game) => {
		if (favorites.length >= MAX_FAVORITES) {
			setAddMsg(t('validation.max_favorites'))
			return
		}
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/favorites/${game.id}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await res.json()
			if (!res.ok) {
				setAddMsg(data.error === 'Already in favorites.'
					? t('profile.already_favorite')
					: data.error === 'Maximum 4 favorites.'
						? t('validation.max_favorites')
						: data.error)
				return
			}
			setAddMsg('')
			setFavorites(prev => [...prev, data].sort((a, b) => a.position - b.position))
			setShowModal(false)
			setSearch('')
			setResults([])
		} catch (err) {
			console.error('Erreur add favorite:', err)
		}
	}

	const handleRemoveFavorite = async (e, game) => {
		e.stopPropagation()
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/favorites/${game.idExterne}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!res.ok) return
			setFavorites(prev => prev.filter(f => f.id !== game.id))
		} catch (err) {
			console.error('Erreur remove favorite:', err)
		}
	}

	const handleClose = () => {
		setShowModal(false)
		setSearch('')
		setResults([])
		setSearchMsg('')
	}

	const slots = Array.from({ length: MAX_FAVORITES }, (_, i) => {
		return displayFavorites.find(f => f.position === i + 1) || null
	})

	return (
		<>
			<div className="profile-favorites">
				<h2 className="profile-section-title">{t('profile.favorite_games')}</h2>
				{!editable && displayFavorites.length === 0 ? (
					<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>
						{t('profile.no_reviews')}
					</p>
				) : (
					<div className="favorites-grid">
						{slots.map((game, i) => (
							game ? (
								<div key={i} className="favorite-card" onClick={() => navigate(`/game/${game.idExterne}`)}>
									{editable && (
										<button className="favorite-remove-btn" onClick={(e) => handleRemoveFavorite(e, game)} style={{ opacity: isTouchDevice ? 1 : undefined }}>
											<FiX size={14} />
										</button>
									)}
									<img src={game.coverImageUrl || "https://placehold.co/160x220"} alt={game.title} className="favorite-img" />
									<p className="favorite-title">{game.title}</p>
								</div>
							) : (
								editable ? (
									<div key={i} className="favorite-card favorite-empty" onClick={() => setShowModal(true)}>
										<div className="favorite-add-placeholder">
											<FiPlus size={28} />
										</div>
									</div>
								) : null
							)
						))}
					</div>
				)}
			</div>

			{showModal && (
				<div className="favorite-modal-overlay" onClick={handleClose}>
					<div className="favorite-modal" onClick={(e) => e.stopPropagation()}>
						<div className="favorite-modal-header">
							<h3 className="favorite-modal-title">{t('profile.add_favorite')}</h3>
							<button className="favorite-modal-close" onClick={handleClose}>
								<FiX size={20} />
							</button>
						</div>
						<input
							className="favorite-modal-input"
							type="text"
							placeholder={t('search.placeholder')}
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
							autoFocus
						/>
						<div className="favorite-modal-results">
							{searchMsg && <p className="favorite-modal-msg">{searchMsg}</p>}
							{results.map((game) => (
								<div key={game.id} className="favorite-modal-result-item" onClick={() => handleAddFavorite(game)}>
									<img src={game.cover} alt={game.title} className="favorite-modal-result-img" />
									<span className="favorite-modal-result-title">{game.title}</span>
								</div>
							))}
						</div>
						{addMsg && <p style={{ color: '#f44336', fontFamily: '"policeConthrax", sans-serif', fontSize: '12px', textAlign: 'center' }}>{addMsg}</p>}
					</div>
				</div>
			)}
		</>
	)
}

export default ProfileFavorites