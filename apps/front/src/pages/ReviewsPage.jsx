import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReviewsNavBar from '../components/ReviewsNavBar'
import ReviewsCard from '../components/ReviewsCard'
import Background from '../components/Background'
import '../styles/ReviewsPage.css'
import Footer from '../components/Footer'
import i18n from '../i18n'

const ReviewsPage = () => {
	const { t } = useTranslation()
	const location = useLocation()
	const [activeTab, setActiveTab] = useState('users')
	const [usersReviews, setUsersReviews] = useState([])
	const [myReviews, setMyReviews] = useState([])
	const [friendsReviews, setFriendsReviews] = useState([])
	const [loading, setLoading] = useState(true)
	const reviewRefs = useRef({})
	const scrollDone = useRef(false)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return
		const headers = { Authorization: `Bearer ${token}` }
		Promise.all([
			fetch('/api/user/reviews/all', { headers }).then(res => res.ok ? res.json() : []),
			fetch('/api/user/reviews', { headers }).then(res => res.ok ? res.json() : []),
			fetch('/api/user/reviews/following', { headers }).then(res => res.ok ? res.json() : [])
		])
			.then(([all, mine, friends]) => {
				setUsersReviews(all)
				setMyReviews(mine)
				setFriendsReviews(friends)
				setLoading(false)
			})
			.catch(err => {
				console.error('Erreur reviews:', err)
				setLoading(false)
			})
	}, [])

	useEffect(() => {
		if (location.state?.tab) {
			setActiveTab(location.state.tab)
		}
	}, [location.state])

	useEffect(() => {
		if (!location.state?.reviewId || loading || scrollDone.current) return
		const id = location.state.reviewId
		setTimeout(() => {
			const el = reviewRefs.current[id]
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' })
				el.style.outline = '2px solid #f5a623'
				el.style.borderRadius = '8px'
				setTimeout(() => { el.style.outline = 'none' }, 2000)
				scrollDone.current = true
			}
		}, 300)
	}, [loading, activeTab, location.state])

	const formatDate = (dateStr) => {
		const locale = i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'es' ? 'es-ES' : 'en-US'
		return new Date(dateStr).toLocaleDateString(locale, {
			weekday: 'long', month: '2-digit', day: '2-digit', year: '2-digit'
		})
	}

	if (loading) return null

	const displayedReviews = activeTab === 'users'
		? usersReviews
		: activeTab === 'friends'
			? friendsReviews
			: myReviews

	const emptyMessage = activeTab === 'users'
		? t('reviews.no_reviews')
		: activeTab === 'friends'
			? t('reviews.no_friends_reviews')
			: t('reviews.no_reviews')

	return (
		<div className="reviews-page">
			<ReviewsNavBar />
			<div className="reviews-tabs">
				<button className={`reviews-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
					{t('reviews.users_reviews')}
				</button>
				<button className={`reviews-tab-btn ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
					{t('reviews.friends_reviews')}
				</button>
				<button className={`reviews-tab-btn ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
					{t('reviews.my_reviews')}
				</button>
			</div>
			<Background style={{ alignItems: "flex-start" }}>
				<div className="reviews-content">
					{displayedReviews.length === 0 ? (
						<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', padding: '40px' }}>
							{emptyMessage}
						</p>
					) : (
						displayedReviews.map((review) => (
							<div key={review.id} ref={el => reviewRefs.current[review.id] = el}>
								<ReviewsCard
									review={{
										id: review.id,
										author: activeTab === 'mine' ? 'You' : review.user.username,
										authorId: activeTab === 'mine' ? null : review.user.id,
										authorAvatar: activeTab === 'mine' ? null : review.user.avatarUrl,
										gameTitle: review.game.title,
										gameImage: review.game.coverImageUrl || "https://placehold.co/160x220",
										gameId: review.game.idExterne,
										text: review.reviewText || '',
										rating: review.rating / 2,
										date: formatDate(review.createdAt)
									}}
									isOwn={activeTab === 'mine'}
									onReviewDeleted={(id) => setMyReviews(prev => prev.filter(r => r.id !== id))}
									onReviewUpdated={(id, updated) => setMyReviews(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r))}
								/>
							</div>
						))
					)}
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default ReviewsPage