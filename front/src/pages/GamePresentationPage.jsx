import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GamePresentationNavBar from '../components/GamePresentationNavBar'
import Background from '../components/Background'
import GamePresentationScreenshots from '../components/GamePresentationScreenshots'
import GamePresentationReviews from '../components/GamePresentationReviews'
import { FiHeart, FiEdit } from 'react-icons/fi'
import { MdSportsEsports } from 'react-icons/md'
import '../styles/GamePresentationPage.css'
import Footer from '../components/Footer'

const GamePresentationPage = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [game, setGame] = useState(null)
	const [liked, setLiked] = useState(false)
	const [inPlayingList, setInPlayingList] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchGame = async () => {
			try {
				const response = await fetch(`/api/games/${id}`)
				const data = await response.json()
				setGame(data)
			} catch (err) {
				console.error('Erreur fetch game:', err)
			} finally {
				setLoading(false)
			}
		}
		fetchGame()
	}, [id])

	// Récupère le statut liked / playing pour ce jeu
	useEffect(() => {
		const fetchStatus = async () => {
			const token = localStorage.getItem('token')
			if (!token) return // pas connecté, on laisse les boutons inactifs

			try {
				const res = await fetch(`/api/user/status/${id}`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				if (res.ok) {
					const data = await res.json()
					setLiked(data.liked)
					setInPlayingList(data.inPlayingList)
				}
			} catch (err) {
				console.error('Erreur statut:', err)
			}
		}
		fetchStatus()
	}, [id])

	// Toggle like
	const handleLike = async () => {
		const token = localStorage.getItem('token')
		if (!token) {
			navigate('/') // pas connecté -> page login
			return
		}
		try {
			const res = await fetch(`/api/user/like/${id}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (res.ok) {
				const data = await res.json()
				setLiked(data.liked)
			}
		} catch (err) {
			console.error('Erreur like:', err)
		}
	}

	// Toggle playing list
	const handlePlaying = async () => {
		const token = localStorage.getItem('token')
		if (!token) {
			navigate('/')
			return
		}
		try {
			const res = await fetch(`/api/user/playing/${id}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (res.ok) {
				const data = await res.json()
				setInPlayingList(data.inList)
			}
		} catch (err) {
			console.error('Erreur playing:', err)
		}
	}

	const getCover = (game) => {
		if (game?.coverImageUrl) return game.coverImageUrl
		if (game?.cover?.url) {
			const url = game.cover.url
			return url.startsWith('//') ? `https:${url.replace('t_thumb', 't_cover_big')}` : url
		}
		return "https://placehold.co/300x400"
	}

	const formatScreenshot = (url) => {
		if (!url) return null
		return url.startsWith('//') ? `https:${url.replace('t_thumb', 't_screenshot_huge')}` : url
	}

	const formatDate = (value) => {
		if (!value) return 'N/A'
		if (typeof value === 'number') return new Date(value * 1000).toLocaleDateString('fr-FR')
		const date = new Date(value)
		return isNaN(date) ? 'N/A' : date.toLocaleDateString('fr-FR')
	}

	const getGenres = (game) => {
		if (game?.genre) return game.genre.split(', ')
		if (game?.genres) return game.genres.map(g => g.name)
		return []
	}

	const renderStars = (rating) => {
		const stars = Math.round(rating / 20)
		return [1, 2, 3, 4, 5].map((star) => (
			<span key={star} style={{ color: stars >= star ? '#f5a623' : '#555', fontSize: '22px' }}>★</span>
		))
	}

	const gameName = game?.title || game?.name || '...'
	const developer = game?.developer || game?.involved_companies?.find(c => c.developer)?.company?.name || 'N/A'
	const publisher = game?.involved_companies?.find(c => c.publisher)?.company?.name || 'N/A'
	const genres = getGenres(game)

	const handleWriteReview = () => {
		navigate('/post', { state: { selectedGame: { title: gameName, image: getCover(game), id: game?.idExterne || game?.id } } })
	}

	if (loading) return (
		<div className="gamepresentation-page">
			<GamePresentationNavBar gameName="..." />
			<Background style={{ alignItems: "center", justifyContent: "center" }}>
				<p style={{ color: '#e7e7e7', fontFamily: 'policeConthrax', fontSize: '20px' }}>Chargement...</p>
			</Background>
		</div>
	)

	if (!game) return (
		<div className="gamepresentation-page">
			<GamePresentationNavBar gameName="Jeu introuvable" />
			<Background style={{ alignItems: "center", justifyContent: "center" }}>
				<p style={{ color: '#e7e7e7', fontFamily: 'policeConthrax', fontSize: '20px' }}>Jeu introuvable.</p>
			</Background>
		</div>
	)

	const screenshots = [
		...(game.screenshots || []).map(s => formatScreenshot(s.url)).filter(Boolean),
		...(game.artworks || []).map(a => formatScreenshot(a.url)).filter(Boolean),
	].slice(0, 6)

	return (
		<div className="gamepresentation-page">
			<GamePresentationNavBar gameName={gameName} />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="gamepresentation-content">

					<div className="gamepresentation-main">

						<div className="gamepresentation-left">
							<img src={getCover(game)} alt={gameName} className="gamepresentation-cover" />

							<div className="gamepresentation-actions">
								<button
									className={`gamepresentation-action-btn ${liked ? 'active-like' : ''}`}
									onClick={handleLike}
									title="Like"
								>
									<FiHeart />
								</button>
								<button
									className={`gamepresentation-action-btn ${inPlayingList ? 'active-playing' : ''}`}
									onClick={handlePlaying}
									title="Add to Playing List"
								>
									<MdSportsEsports />
								</button>
								<button
									className="gamepresentation-action-btn"
									onClick={handleWriteReview}
									title="Write a review"
								>
									<FiEdit />
								</button>
							</div>

							{screenshots.length > 0 && (
								<GamePresentationScreenshots screenshots={screenshots} />
							)}
						</div>

						<div className="gamepresentation-right">

							<h1 className="gamepresentation-game-name">{gameName}</h1>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Description</h3>
								<p className="gamepresentation-info-text">{game.summary || 'Aucune description disponible.'}</p>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Developers</h3>
								<p className="gamepresentation-info-text">{developer}</p>
								{publisher !== 'N/A' && (
									<>
										<h3 className="gamepresentation-info-title" style={{ marginTop: '10px' }}>Publisher</h3>
										<p className="gamepresentation-info-text">{publisher}</p>
									</>
								)}
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Release Date</h3>
								<p className="gamepresentation-info-text">{formatDate(game.releaseDate || game.first_release_date)}</p>
							</div>

							{genres.length > 0 && (
								<div className="gamepresentation-info-block">
									<h3 className="gamepresentation-info-title">Genres</h3>
									<div className="gamepresentation-tags">
										{genres.map((genre, i) => (
											<span key={i} className="gamepresentation-tag">{genre}</span>
										))}
									</div>
								</div>
							)}

							{game.platforms && (
								<div className="gamepresentation-info-block">
									<h3 className="gamepresentation-info-title">Platforms</h3>
									<div className="gamepresentation-tags">
										{game.platforms.map((platform, i) => (
											<span key={i} className="gamepresentation-tag">{platform.name}</span>
										))}
									</div>
								</div>
							)}

							{game.rating && (
								<div className="gamepresentation-info-block">
									<h3 className="gamepresentation-info-title">IGDB Rating</h3>
									<div className="gamepresentation-rating">
										{renderStars(game.rating)}
										<span className="gamepresentation-rating-number">{(game.rating / 10).toFixed(1)}/10</span>
									</div>
								</div>
							)}

							{game.reviews?.length > 0 && (
								<div className="gamepresentation-info-block">
									<h3 className="gamepresentation-info-title">User Rating</h3>
									<div className="gamepresentation-rating">
										{renderStars(game.reviews.reduce((sum, r) => sum + r.rating, 0) / game.reviews.length * 20)}
										<span className="gamepresentation-rating-number">
											{(game.reviews.reduce((sum, r) => sum + r.rating, 0) / game.reviews.length).toFixed(1)}/5
										</span>
									</div>
								</div>
							)}

						</div>
					</div>

					<GamePresentationReviews gameId={game?.idExterne || id} />

				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default GamePresentationPage