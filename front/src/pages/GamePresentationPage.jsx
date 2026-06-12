import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GamePresentationNavBar from '../components/GamePresentationNavBar'
import Background from '../components/Background'
import GamePresentationScreenshots from '../components/GamePresentationScreenshots'
import GamePresentationReviews from '../components/GamePresentationReviews'
import { FiHeart, FiMonitor, FiEdit } from 'react-icons/fi'
import { MdSportsEsports } from 'react-icons/md'
import '../styles/GamePresentationPage.css'

const fakeGame = {
	name: "Elden Ring",
	cover: "https://placehold.co/300x400",
	description: "Elden Ring est un action-RPG développé par FromSoftware en collaboration avec George R.R. Martin. Explorez les Terres Intermédiaires, un monde vaste et mystérieux.",
	developer: "FromSoftware",
	publisher: "Bandai Namco",
	releaseDate: "25 février 2022",
	genres: ["Action", "RPG", "Open World"],
	platforms: ["PC", "PS5", "Xbox Series X"],
	rating: 9.5,
	screenshots: Array.from({ length: 6 }, () => "https://placehold.co/300x170")
}

const GamePresentationPage = () => {
	const [liked, setLiked] = useState(false)
	const [inPlayingList, setInPlayingList] = useState(false)
	const navigate = useNavigate()

	const handleWriteReview = () => {
		navigate('/post', { state: { selectedGame: { title: fakeGame.name, image: fakeGame.cover } } })
	}

	const renderRating = (rating) => {
		const stars = Math.round(rating / 2)
		return [1, 2, 3, 4, 5].map((star) => (
			<span key={star} style={{ color: stars >= star ? '#f5a623' : '#555', fontSize: '22px' }}>★</span>
		))
	}

	return (
		<div className="gamepresentation-page">
			<GamePresentationNavBar gameName={fakeGame.name} />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="gamepresentation-content">

					<div className="gamepresentation-main">

						{/* Colonne gauche */}
						<div className="gamepresentation-left">
							<img src={fakeGame.cover} alt={fakeGame.name} className="gamepresentation-cover" />

							{/* Boutons actions */}
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

							<GamePresentationScreenshots screenshots={fakeGame.screenshots} />
						</div>

						{/* Colonne droite */}
						<div className="gamepresentation-right">

							<h1 className="gamepresentation-game-name">{fakeGame.name}</h1>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Description</h3>
								<p className="gamepresentation-info-text">{fakeGame.description}</p>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Developers</h3>
								<p className="gamepresentation-info-text">{fakeGame.developer}</p>
								<h3 className="gamepresentation-info-title" style={{ marginTop: '10px' }}>Publisher</h3>
								<p className="gamepresentation-info-text">{fakeGame.publisher}</p>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Release Date</h3>
								<p className="gamepresentation-info-text">{fakeGame.releaseDate}</p>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Genres</h3>
								<div className="gamepresentation-tags">
									{fakeGame.genres.map((genre, i) => (
										<span key={i} className="gamepresentation-tag">{genre}</span>
									))}
								</div>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">Platforms</h3>
								<div className="gamepresentation-tags">
									{fakeGame.platforms.map((platform, i) => (
										<span key={i} className="gamepresentation-tag">{platform}</span>
									))}
								</div>
							</div>

							<div className="gamepresentation-info-block">
								<h3 className="gamepresentation-info-title">IGDB Rating</h3>
								<div className="gamepresentation-rating">
									{renderRating(fakeGame.rating)}
									<span className="gamepresentation-rating-number">{fakeGame.rating}/10</span>
								</div>
							</div>

						</div>
					</div>

					<GamePresentationReviews />

				</div>
			</Background>
		</div>
	)
}

export default GamePresentationPage