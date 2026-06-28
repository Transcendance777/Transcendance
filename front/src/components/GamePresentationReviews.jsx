import '../styles/GamePresentationReviews.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi'

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const GamePresentationReviews = ({ gameId }) => {
	const navigate = useNavigate()
	const [reviews, setReviews] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!gameId) return
		const token = localStorage.getItem('token')
		const headers = token ? { Authorization: `Bearer ${token}` } : {}

		fetch(`/api/games/${gameId}`, { headers })
			.then(res => res.ok ? res.json() : null)
			.then(data => {
				if (data?.reviews) setReviews(data.reviews)
				setLoading(false)
			})
			.catch(err => {
				console.error('Erreur reviews:', err)
				setLoading(false)
			})
	}, [gameId])

	const renderStars = (ratingInt) => {
		const rating = ratingInt / 2
		return [1, 2, 3, 4, 5].map((star) => {
			const full = rating >= star
			const half = !full && rating >= star - 0.5
			return (
				<span key={star} style={{
					fontSize: '18px',
					background: half ? 'linear-gradient(90deg, #f5a623 50%, #555 50%)' : 'none',
					WebkitBackgroundClip: half ? 'text' : 'none',
					WebkitTextFillColor: half ? 'transparent' : (full ? '#f5a623' : '#555'),
					color: full ? '#f5a623' : '#555'
				}}>★</span>
			)
		})
	}

	const formatDate = (dateStr) => {
		const d = new Date(dateStr)
		return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
	}

	if (loading) return null

	return (
		<div className="gamepresentation-reviews">
			<h2 className="gamepresentation-reviews-title">Reviews</h2>
			{reviews.length === 0 ? (
				<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>
					No reviews yet.
				</p>
			) : (
				reviews.map((review, i) => (
					<div key={i} className="gamepresentation-review-item">
						<div className="gamepresentation-review-header">
							<div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
								onClick={() => navigate(`/profile/${review.userId}`)}>
								<img
									src={getAvatar(review.user?.avatarUrl, review.user?.username)}
									alt={review.user?.username}
									style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e7e7e7' }}
								/>
								<span className="gamepresentation-review-author">{review.user?.username}</span>
							</div>
							<span className="gamepresentation-review-date">{formatDate(review.createdAt)}</span>
						</div>
						<p className="gamepresentation-review-text">{review.reviewText || ''}</p>
						<div className="gamepresentation-review-footer">
							<div>{renderStars(review.rating)}</div>
						</div>
					</div>
				))
			)}
		</div>
	)
}

export default GamePresentationReviews