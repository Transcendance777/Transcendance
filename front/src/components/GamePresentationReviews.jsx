import '../styles/GamePresentationReviews.css'
import { useState } from 'react'
import { FiThumbsUp, FiThumbsDown, FiCornerDownRight } from 'react-icons/fi'

const fakeGameReviews = [
	{ author: "Tuntung sahur", text: "Ce jeu est incroyable, je recommande vraiment !", rating: 5, date: "04/25/26" },
	{ author: "Brimbrim patapim", text: "Pas mal mais un peu répétitif.", rating: 3, date: "04/20/26" },
]

const GamePresentationReviews = () => {
	const [liked, setLiked] = useState({})
	const [disliked, setDisliked] = useState({})

	const handleLike = (i) => {
		setLiked(prev => ({ ...prev, [i]: !prev[i] }))
		setDisliked(prev => ({ ...prev, [i]: false }))
	}

	const handleDislike = (i) => {
		setDisliked(prev => ({ ...prev, [i]: !prev[i] }))
		setLiked(prev => ({ ...prev, [i]: false }))
	}

	const renderStars = (rating) => {
		return [1, 2, 3, 4, 5].map((star) => (
			<span key={star} style={{ color: rating >= star ? '#f5a623' : '#555', fontSize: '18px' }}>★</span>
		))
	}

	return (
		<div className="gamepresentation-reviews">
			<h2 className="gamepresentation-reviews-title">Reviews</h2>
			{fakeGameReviews.map((review, i) => (
				<div key={i} className="gamepresentation-review-item">
					<div className="gamepresentation-review-header">
						<span className="gamepresentation-review-author">{review.author}</span>
						<span className="gamepresentation-review-date">{review.date}</span>
					</div>
					<p className="gamepresentation-review-text">{review.text}</p>
					<div className="gamepresentation-review-footer">
						<div>{renderStars(review.rating)}</div>
						<div className="gamepresentation-review-actions">
							<button
								className={`gamepresentation-review-btn ${liked[i] ? 'liked' : ''}`}
								onClick={() => handleLike(i)}
							><FiThumbsUp /></button>
							<button
								className={`gamepresentation-review-btn ${disliked[i] ? 'disliked' : ''}`}
								onClick={() => handleDislike(i)}
							><FiThumbsDown /></button>
							<button className="gamepresentation-review-btn"><FiCornerDownRight /></button>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

export default GamePresentationReviews