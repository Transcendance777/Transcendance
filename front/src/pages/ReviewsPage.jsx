import { useState, useEffect } from 'react'
import ReviewsNavBar from '../components/ReviewsNavBar'
import ReviewsCard from '../components/ReviewsCard'
import Background from '../components/Background'
import '../styles/ReviewsPage.css'

const ReviewsPage = () => {
	const [reviews, setReviews] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return

		fetch('/api/user/reviews/all', {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(res => res.ok ? res.json() : [])
			.then(data => {
				setReviews(data)
				setLoading(false)
			})
			.catch(err => {
				console.error('Erreur reviews:', err)
				setLoading(false)
			})
	}, [])

	if (loading) return null

	return (
		<div className="reviews-page">
			<ReviewsNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="reviews-content">
					{reviews.length === 0 ? (
						<p style={{
							color: 'rgba(231,231,231,0.5)',
							fontFamily: '"policeConthrax", sans-serif',
							fontSize: '13px',
							padding: '40px'
						}}>
							No reviews yet.
						</p>
					) : (
						reviews.map((review) => (
							<ReviewsCard key={review.id} review={{
								id: review.id,
								author: review.user.username,
								authorId: review.user.id,
								authorAvatar: review.user.avatarUrl,
								gameTitle: review.game.title,
								gameImage: review.game.coverImageUrl || "https://placehold.co/160x220",
								gameId: review.game.idExterne,
								text: review.reviewText || '',
								rating: review.rating / 2,
								date: new Date(review.createdAt).toLocaleDateString('en-US', {
									weekday: 'long', month: '2-digit', day: '2-digit', year: '2-digit'
								})
							}} />
						))
					)}
				</div>
			</Background>
		</div>
	)
}

export default ReviewsPage