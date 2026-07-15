import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PostNavBar from '../components/PostNavBar'
import Background from '../components/Background'
import PostStars from '../components/PostStars'
import PostGamePicker from '../components/PostGamePicker'
import '../styles/PostPage.css'
import Footer from '../components/Footer'
import { validateInternalRating, validateReviewText } from '../utils/validation.js'

const MAX_CHARS = 500

const PostPage = () => {
	const { t } = useTranslation()
	const location = useLocation()
	const [review, setReview] = useState('')
	const [rating, setRating] = useState(null)
	const [selectedGame, setSelectedGame] = useState(null)
	const [showPicker, setShowPicker] = useState(false)
	const [submitMsg, setSubmitMsg] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const [starsKey, setStarsKey] = useState(0)

	useEffect(() => {
		if (location.state?.selectedGame) {
			setSelectedGame(location.state.selectedGame)
		}
	}, [location.state])

	const showError = (msg) => {
		setSubmitMsg(msg)
		setTimeout(() => setSubmitMsg(''), 2000)
	}

	const handleSubmit = async () => {
		if (!selectedGame) return showError(t('post.choose_game_msg'))

		const ratingResult = validateInternalRating(rating)
		if (!ratingResult.ok) return showError(t('post.choose_rating'))

		const textResult = validateReviewText(review)
		if (!textResult.ok) return showError(t(textResult.errorKey))

		const token = localStorage.getItem('token')
		setSubmitting(true)
		setSubmitMsg('')
		try {
			const res = await fetch('/api/user/review', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					gameId: selectedGame.id,
					rating: ratingResult.value,
					reviewText: textResult.value
				})
			})
			const data = await res.json()
			if (!res.ok) {
				const errorKey = data.error === 'You already posted a review for this game.' ? 'post.already_reviewed' : 'post.server_error'
				showError(t(errorKey))
				return
			}

			setReview('')
			setRating(null)
			setSelectedGame(null)
			setStarsKey(k => k + 1)
			setSubmitted(true)
			setTimeout(() => setSubmitted(false), 2000)
		} catch (err) {
			showError(t('post.server_error'))
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="post-page">
			<PostNavBar />
			<Background style={{ alignItems: "flex-start", justifyContent: "flex-start" }}>
				<div className="post-content">

					<div className="post-left">
						<p className="post-label">{t('post.write_review')}</p>
						<textarea
							className="post-textarea"
							value={review}
							onChange={(e) => setReview(e.target.value)}
							placeholder={t('post.write_here')}
							maxLength={MAX_CHARS}
						/>
						<div className="post-bottom">
							<p className="post-char-count">{review.length}/{MAX_CHARS}</p>
						</div>
					</div>

					<div className="post-right">
						<p className="post-label">{t('post.choose_game')}</p>
						<div className="post-game-preview" onClick={() => setShowPicker(true)}>
							{selectedGame ? (
								<>
									<img src={selectedGame.image} alt={selectedGame.title} className="post-game-img" />
									<p className="post-game-name">{selectedGame.title}</p>
								</>
							) : (
								<div className="post-game-placeholder">{t('post.click_to_choose')}</div>
							)}
						</div>
						<PostStars key={starsKey} onRate={setRating} />
						<button
							className={`post-submit-btn ${submitted ? 'submitted' : ''}`}
							onClick={handleSubmit}
							disabled={submitting || submitted}
						>
							{submitted ? '✓' : '➜'}
						</button>
					</div>

				</div>

				{showPicker && (
					<PostGamePicker
						onSelect={setSelectedGame}
						onClose={() => setShowPicker(false)}
					/>
				)}
			</Background>

			{submitMsg && (
				<p style={{
					position: 'fixed',
					bottom: '120px',
					right: '40px',
					color: '#f44336',
					fontFamily: '"policeConthrax", sans-serif',
					fontSize: '13px',
					zIndex: 100
				}}>
					{submitMsg}
				</p>
			)}
			<Footer />
		</div>
	)
}

export default PostPage