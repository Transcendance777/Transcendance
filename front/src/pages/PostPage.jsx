import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PostNavBar from '../components/PostNavBar'
import Background from '../components/Background'
import PostStars from '../components/PostStars'
import PostGamePicker from '../components/PostGamePicker'
import '../styles/PostPage.css'

const MAX_CHARS = 500

const PostPage = () => {
	const location = useLocation()
	const [review, setReview] = useState('')
	const [rating, setRating] = useState(null)
	const [selectedGame, setSelectedGame] = useState(null)
	const [showPicker, setShowPicker] = useState(false)

	// Récupère le jeu passé depuis la page de présentation
	useEffect(() => {
		if (location.state?.selectedGame) {
			setSelectedGame(location.state.selectedGame)
		}
	}, [location.state])

	const handleSubmit = () => {
		console.log({ review, rating, selectedGame })
	}

	return (
		<div className="post-page">
			<PostNavBar />
			<Background style={{ alignItems: "flex-start", justifyContent: "flex-start" }}>
				<div className="post-content">

					<div className="post-left">
						<p className="post-label">Write your review :</p>
						<textarea
							className="post-textarea"
							value={review}
							onChange={(e) => setReview(e.target.value)}
							placeholder="Write your review here..."
							maxLength={MAX_CHARS}
						/>
						<div className="post-bottom">
							<p className="post-char-count">{review.length}/{MAX_CHARS}</p>
						</div>
					</div>

					<div className="post-right">
						<p className="post-label">Choose a game :</p>
						<div className="post-game-preview" onClick={() => setShowPicker(true)}>
							{selectedGame ? (
								<>
									<img src={selectedGame.image} alt={selectedGame.title} className="post-game-img" />
									<p className="post-game-name">{selectedGame.title}</p>
								</>
							) : (
								<div className="post-game-placeholder">Click to choose</div>
							)}
						</div>
						<PostStars onRate={setRating} />
					</div>

				</div>

				<button className="post-submit-btn" onClick={handleSubmit}>➜</button>

				{showPicker && (
					<PostGamePicker
						onSelect={setSelectedGame}
						onClose={() => setShowPicker(false)}
					/>
				)}
			</Background>
		</div>
	)
}

export default PostPage