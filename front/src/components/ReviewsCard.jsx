import '../styles/ReviewsCard.css'
import { useState } from 'react'
import { FiCornerDownRight, FiThumbsUp, FiThumbsDown } from 'react-icons/fi'

const MAX_REPLY = 200

const ReviewsCard = ({ review }) => {
	const [liked, setLiked] = useState(false)
	const [disliked, setDisliked] = useState(false)
	const [showReply, setShowReply] = useState(false)
	const [reply, setReply] = useState('')
	const [replies, setReplies] = useState([])

	const handleLike = () => {
		setLiked(!liked)
		setDisliked(false)
	}

	const handleDislike = () => {
		setDisliked(!disliked)
		setLiked(false)
	}

	const handleReplySubmit = () => {
		if (reply.trim() === '') return
		setReplies([...replies, reply])
		setReply('')
		setShowReply(false)
	}

	const renderStars = (rating) => {
		return [1, 2, 3, 4, 5].map((star) => (
			<span key={star} className={`review-star ${rating >= star ? 'active' : ''}`}>★</span>
		))
	}

	return (
		<div className="review-card">
			<div className="review-card-left">
				<img src={review.gameImage} alt={review.gameTitle} className="review-game-img" />
				<p className="review-game-title">{review.gameTitle}</p>
			</div>

			<div className="review-card-right">
				<p className="review-author">{review.author} commented :</p>
				<p className="review-text">{review.text}</p>

				<div className="review-footer">
					<div className="review-stars">
						{renderStars(review.rating)}
					</div>

					<div className="review-actions">
						<button
							className={`review-like-btn ${liked ? 'liked' : ''}`}
							onClick={handleLike}
						>
							<FiThumbsUp />
						</button>
						<button
							className={`review-dislike-btn ${disliked ? 'disliked' : ''}`}
							onClick={handleDislike}
						>
							<FiThumbsDown />
						</button>
						<button
							className={`review-reply-btn ${showReply ? 'active' : ''}`}
							onClick={() => setShowReply(!showReply)}
						>
							<FiCornerDownRight />
						</button>
					</div>

					<p className="review-date">Posted on {review.date}</p>
				</div>

				{showReply && (
					<div className="review-reply-box">
						<button className="reply-emoji-btn">+</button>
						<textarea
							className="reply-textarea"
							placeholder="Écris ta réponse..."
							value={reply}
							onChange={(e) => setReply(e.target.value)}
							maxLength={MAX_REPLY}
						/>
						<div className="reply-bottom">
							<span className="reply-count">{reply.length}/{MAX_REPLY}</span>
							<button className="reply-submit-btn" onClick={handleReplySubmit}>→</button>
						</div>
					</div>
				)}

				{replies.length > 0 && (
					<div className="replies-list">
						{replies.map((r, i) => (
							<div key={i} className="reply-item">
								<p className="reply-text">↩ {r}</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default ReviewsCard