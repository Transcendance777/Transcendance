import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GamePresentationNavBar from '../components/GamePresentationNavBar'
import Background from '../components/Background'
import GamePresentationScreenshots from '../components/GamePresentationScreenshots'
import GamePresentationReviews from '../components/GamePresentationReviews'
import { FiHeart, FiEdit } from 'react-icons/fi'
import { MdSportsEsports } from 'react-icons/md'
import '../styles/GamePresentationPage.css'

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

	const formatCover = (url) => url ? `https:${url.replace('t_thumb', 't_cover_big')}` : "https://placehold.co/300x400"
	const formatScreenshot = (url) => url ? `https:${url.replace('t_thumb', 't_screenshot_huge')}` : null
	const formatDate = (timestamp) => timestamp ? new Date(timestamp * 1000).toLocaleDateString('fr-FR') : 'N/A'
	const formatRating = (rating) => rating ? (rating / 10).toFixed(1) : 'N/A'

	const renderRating = (rating) => {
		const stars = Math.round(rating / 20)
		return [1, 2, 3, 4, 5].map((star) => (
			<span key={star} style={{ color: stars >= star ? '#f5a623' : '#555', fontSize: '22px' }}>★</span>
		))
	}

	const handleWriteReview = () => {
		navigate('/post', { state: { selectedGame: { title: game?.name, image: formatCover(game?.cover?.url), id: game?.id } } })
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
	]

	const developer = game.involved_companies?.find(c => c.developer)?.company?.name || 'N/A'
	const publisher = game.involved_companies?.find(c => c.publisher)?.company?.name || 'N/A'

	return (
		<div className="gamepresentation-page">
			<GamePresentationNavBar gameName={game.name} />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="gamepresentation-content">

					<div className="gamepresentation-main">

						<div className="gamepresentation-left">
							<img src={formatCover(game.cover?.url)} alt={game.name} className="gamepresentation-cover" />

							<div className="gamepresentation-actions">
								<button
									className={`gamepresentation-action-btn ${liked ? 'active-like' : ''}`}
									onClick={() => setLiked(!liked)}
									title="Like"
								>
									<FiHeart />
								</button>
								<button
									className={`gamepresentation-action-btn ${inPlayingList ? 'active-playing' : ''}`}
									onClick={() => setInPlayingList(!inPlayingList)}
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

							<h1 className="gamepresentation-game-name">{game.name}</h1>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Description</h3>
								<p className="gamepresentation-info-text">{game.summary || 'Aucune description disponible.'}</p>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Developers</h3>
								<p className="gamepresentation-info-text">{developer}</p>
								<h3 className="gamepresentation-info-title" style={{ marginTop: '10px' }}>Publisher</h3>
								<p className="gamepresentation-info-text">{publisher}</p>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Release Date</h3>
								<p className="gamepresentation-info-text">{formatDate(game.first_release_date)}</p>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Genres</h3>
								<div className="gamepresentation-tags">
									{game.genres?.map((genre, i) => (
										<span key={i} className="gamepresentation-tag">{genre.name}</span>
									)) || <p className="gamepresentation-info-text">N/A</p>}
								</div>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Platforms</h3>
								<div className="gamepresentation-tags">
									{game.platforms?.map((platform, i) => (
										<span key={i} className="gamepresentation-tag">{platform.name}</span>
									)) || <p className="gamepresentation-info-text">N/A</p>}
								</div>
							</div>

							{game.rating && (
								<div className="gamepresentation-info-block">
									<h3 className="gamepresentation-info-title">IGDB Rating</h3>
									<div className="gamepresentation-rating">
										{renderRating(game.rating)}
										<span className="gamepresentation-rating-number">{formatRating(game.rating)}/10</span>
									</div>
								</div>
							)}

						</div>
					</div>

					<GamePresentationReviews />

				</div>
			</Background>
		</div>
	)
}

export default GamePresentationPage