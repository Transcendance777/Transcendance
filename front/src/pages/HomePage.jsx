import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import HomeNavBar from '../components/HomeNavBar'
import Background from '../components/Background'
import '../styles/HomePage.css'
import Footer from '../components/Footer'

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const HomePage = () => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const [newReleases, setNewReleases] = useState([])
	const [highlyPraised, setHighlyPraised] = useState([])
	const [popular, setPopular] = useState([])
	const [comingSoon, setComingSoon] = useState([])
	const [reviews, setReviews] = useState([])
	const [othersReviews, setOthersReviews] = useState([])
	const [likedGames, setLikedGames] = useState([])
	const [playingList, setPlayingList] = useState([])
	const [following, setFollowing] = useState([])
	const [friendsActivity, setFriendsActivity] = useState([])

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const token = params.get('token')
		const user = params.get('user')
		if (token && user) {
			localStorage.setItem('token', token)
			localStorage.setItem('user', user)
			window.history.replaceState({}, '', '/home')
		}
	}, [])

	useEffect(() => {
		const token = localStorage.getItem('token')
		const headers = token ? { Authorization: `Bearer ${token}` } : {}

		const formatGames = (games) => (Array.isArray(games) ? games : []).slice(0, 9).map(g => ({
			id: g.idExterne || g.id,
			title: g.title || g.name,
			image: g.coverImageUrl ||
				(g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : "https://placehold.co/120x160")
		}))

		Promise.all([
			fetch('/api/games/new-releases').then(r => r.json()),
			fetch('/api/games/recent-acclaimed').then(r => r.json()),
			fetch('/api/games/popular').then(r => r.json()),
			fetch('/api/games/coming-soon').then(r => r.json()),
		]).then(([newR, highP, pop, soon]) => {
			setNewReleases(formatGames(newR))
			setHighlyPraised(formatGames(highP))
			setPopular(formatGames(pop))
			setComingSoon(formatGames(soon))
		}).catch(err => console.error('Erreur fetch jeux:', err))

		if (!token) return

		Promise.all([
			fetch('/api/user/reviews', { headers }).then(r => r.ok ? r.json() : []),
			fetch('/api/user/reviews/all', { headers }).then(r => r.ok ? r.json() : []),
			fetch('/api/user/liked', { headers }).then(r => r.ok ? r.json() : []),
			fetch('/api/user/playing', { headers }).then(r => r.ok ? r.json() : []),
			fetch('/api/user/following', { headers }).then(r => r.ok ? r.json() : []),
			fetch('/api/user/friends-activity', { headers }).then(r => r.ok ? r.json() : []),
		]).then(([rev, othersRev, liked, playing, follow, activity]) => {
			setReviews(rev)
			setOthersReviews(othersRev)
			setLikedGames(liked)
			setPlayingList(playing)
			setFollowing(follow)
			setFriendsActivity(activity)
		}).catch(err => console.error('Erreur fetch user:', err))
	}, [])

	const renderStars = (ratingInt) => {
		const rating = ratingInt / 2
		return [1, 2, 3, 4, 5].map((star) => {
			const full = rating >= star
			const half = !full && rating >= star - 0.5
			return (
				<span key={star} style={{
					fontSize: '14px',
					background: half ? 'linear-gradient(90deg, #f5a623 50%, #555 50%)' : 'none',
					WebkitBackgroundClip: half ? 'text' : 'none',
					WebkitTextFillColor: half ? 'transparent' : (full ? '#f5a623' : '#555'),
					color: full ? '#f5a623' : '#555'
				}}>★</span>
			)
		})
	}

	const getEmoji = (type) => {
		if (type === 'liked') return '❤️'
		if (type === 'reviewed') return '⭐'
		if (type === 'playing') return '🎮'
		if (type === 'followed') return '👤'
		return '•'
	}

	const getAction = (type) => {
		if (type === 'liked') return t('activity.liked')
		if (type === 'reviewed') return t('activity.reviewed')
		if (type === 'playing') return t('activity.playing')
		if (type === 'followed') return t('activity.followed')
		return ''
	}

	return (
		<div className="home-page">
			<HomeNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="home-content">

					{/* New releases + Recent hits */}
					<div className="home-section">
						<div className="home-highlights">
							<div className="home-highlight-card" onClick={() => navigate('/games?category=new-releases')}>
								<h2 className="home-section-title">{t('home.new_releases')}</h2>
								<div className="home-highlight-grid">
									<div className="home-highlight-track">
										{[...newReleases, ...newReleases].map((game, i) => (
											<div key={i} className="home-highlight-game" onClick={(e) => { e.stopPropagation(); navigate(`/game/${game.id}`) }}>
												<img src={game.image} alt={game.title} className="home-highlight-game-img" />
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="home-highlight-card" onClick={() => navigate('/games?category=recent-acclaimed')}>
								<h2 className="home-section-title">{t('home.recent_hits')}</h2>
								<div className="home-highlight-grid">
									<div className="home-highlight-track">
										{[...highlyPraised, ...highlyPraised].map((game, i) => (
											<div key={i} className="home-highlight-game" onClick={(e) => { e.stopPropagation(); navigate(`/game/${game.id}`) }}>
												<img src={game.image} alt={game.title} className="home-highlight-game-img" />
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Stats réelles */}
					<div className="home-section">
						<h2 className="home-section-title">{t('home.your_stats')}</h2>
						<div className="home-stats">
							<div className="home-stat-card"
								onClick={() => navigate('/reviews', { state: { tab: 'mine' } })}
								style={{ cursor: 'pointer' }}>
								<span className="home-stat-number">{reviews.length}</span>
								<span className="home-stat-label">{t('home.reviews')}</span>
							</div>
							<div className="home-stat-card"
								onClick={() => navigate('/profile', { state: { openModal: 'likes' } })}
								style={{ cursor: 'pointer' }}>
								<span className="home-stat-number">{likedGames.length}</span>
								<span className="home-stat-label">{t('home.liked_games')}</span>
							</div>
							<div className="home-stat-card"
								onClick={() => navigate('/friends')}
								style={{ cursor: 'pointer' }}>
								<span className="home-stat-number">{following.length}</span>
								<span className="home-stat-label">{t('home.following')}</span>
							</div>
						</div>
					</div>

					{/* Recently reviewed */}
					{othersReviews.length > 0 && (
						<div className="home-section">
							<h2 className="home-section-title" onClick={() => navigate('/reviews')} style={{ cursor: 'pointer' }}>
								{t('home.recently_reviewed')}
							</h2>
							<div className="home-reviews-grid">
								{othersReviews.slice(0, 4).map((review, i) => (
									<div key={i} className="home-review-card" onClick={() => navigate('/reviews', { state: { tab: 'users', reviewId: review.id } })}>
										<img src={review.game.coverImageUrl || "https://placehold.co/80x110"} alt={review.game.title} className="home-review-game-img" />
										<div className="home-review-info">
											<div className="home-review-header">
												<img
													src={getAvatar(review.user?.avatarUrl, review.user?.username)}
													alt={review.user?.username}
													className="home-review-avatar"
													onClick={(e) => { e.stopPropagation(); navigate(`/profile/${review.user?.id}`) }}
												/>
												<span className="home-review-author">{review.user?.username}</span>
											</div>
											<p className="home-review-game">{review.game.title}</p>
											<p className="home-review-text">{review.reviewText || ''}</p>
											<div>{renderStars(review.rating)}</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Friends activity */}
					{friendsActivity.length > 0 && (
						<div className="home-section">
							<h2 className="home-section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/friends')}>
								{t('home.friends_activity')}
							</h2>
							<div className="home-friends-grid">
								{friendsActivity.slice(0, 4).map((activity, i) => (
									<div key={i} className="home-friend-card">
										<img
											src={getAvatar(activity.avatarUrl, activity.username)}
											alt={activity.username}
											className="home-friend-avatar"
											onClick={() => navigate(`/profile/${activity.userId}`)}
										/>
										<div className="home-friend-info">
											<span className="home-friend-username" onClick={() => navigate(`/profile/${activity.userId}`)}>
												{activity.username}
											</span>
											<span className="home-friend-action"> {getAction(activity.type)} </span>
											<span
												className="home-friend-game"
												onClick={() => activity.targetType === 'user'
													? navigate(`/profile/${activity.targetId}`)
													: navigate(`/game/${activity.targetId}`)
												}
											>
												{getEmoji(activity.type)} {activity.target}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Popular this week */}
					<div className="home-section">
						<h2 className="home-section-title">{t('home.popular')}</h2>
						<div className="home-games-grid">
							{popular.map((game, i) => (
								<div key={i} className="home-game-card" onClick={() => navigate(`/game/${game.id}`)}>
									<img src={game.image} alt={game.title} className="home-game-img" />
								</div>
							))}
						</div>
					</div>

					{/* Coming soon */}
					<div className="home-section">
						<h2 className="home-section-title">{t('home.coming_soon')}</h2>
						<div className="home-games-grid">
							{comingSoon.map((game, i) => (
								<div key={i} className="home-game-card" onClick={() => navigate(`/game/${game.id}`)}>
									<img src={game.image} alt={game.title} className="home-game-img" />
								</div>
							))}
						</div>
					</div>

					{/* Playing list */}
					{playingList.length > 0 && (
						<div className="home-section">
							<h2 className="home-section-title"
								style={{ cursor: 'pointer' }}
								onClick={() => navigate('/games')}>
								{t('home.playing_list')}
							</h2>
							<div className="home-games-grid">
								{playingList.slice(0, 8).map((game, i) => (
									<div key={i} className="home-game-card" onClick={() => navigate(`/game/${game.idExterne}`)}>
										<img src={game.coverImageUrl || "https://placehold.co/120x160"} alt={game.title} className="home-game-img" />
									</div>
								))}
							</div>
						</div>
					)}

				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default HomePage