import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomeNavBar from '../components/HomeNavBar'
import Background from '../components/Background'
import '../styles/HomePage.css'

const fakeStats = {
	reviews: 34,
	liked: 87,
	friends: 12,
}

const fakeFriends = Array.from({ length: 4 }, (_, i) => ({
	username: `Ami ${i + 1}`,
	avatar: "https://placehold.co/40x40",
}))

const fakeFriendsActivity = Array.from({ length: 4 }, (_, i) => ({
	username: `Ami ${i + 1}`,
	avatar: "https://placehold.co/40x40",
	action: i % 2 === 0 ? "liked" : "reviewed",
	gameTitle: `Jeu ${i + 1}`,
	gameImage: "https://placehold.co/80x110",
}))

const fakePlayingList = Array.from({ length: 4 }, (_, i) => ({
	title: `Jeu ${i + 1}`,
	image: "https://placehold.co/120x160",
}))

const fakeLikedGames = Array.from({ length: 4 }, (_, i) => ({
	title: `Jeu ${i + 1}`,
	image: "https://placehold.co/120x160",
}))

const fakeRecentReviews = Array.from({ length: 4 }, (_, i) => ({
	author: `User ${i + 1}`,
	avatar: "https://placehold.co/40x40",
	gameTitle: `Jeu ${i + 1}`,
	gameImage: "https://placehold.co/80x110",
	text: "Super jeu, je recommande vraiment à tout le monde !",
	rating: Math.floor(Math.random() * 5) + 1,
}))

const HomePage = () => {
	const navigate = useNavigate()
	const [statsModal, setStatsModal] = useState(null)
	const [newReleases, setNewReleases] = useState([])
	const [highlyPraised, setHighlyPraised] = useState([])
	const [popular, setPopular] = useState([])
	const [comingSoon, setComingSoon] = useState([])

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [newR, highP, pop, soon] = await Promise.all([
					fetch('/api/games/new-releases').then(r => r.json()),
					fetch('/api/games/highly-praised').then(r => r.json()),
					fetch('/api/games/popular').then(r => r.json()),
					fetch('/api/games/coming-soon').then(r => r.json()),
				])

				const formatGames = (games) => games.slice(0, 4).map(g => ({
					id: g.idExterne || g.id,
					title: g.title || g.name,
					image: g.coverImageUrl ||
						(g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : "https://placehold.co/120x160")
				}))

				setNewReleases(formatGames(newR))
				setHighlyPraised(formatGames(highP))
				setPopular(formatGames(pop))
				setComingSoon(formatGames(soon))
			} catch (err) {
				console.error('Erreur fetch IGDB:', err)
			}
		}
		fetchAll()
	}, [])

	const renderStars = (rating) => {
		return [1, 2, 3, 4, 5].map((star) => (
			<span key={star} style={{ color: rating >= star ? '#f5a623' : '#555', fontSize: '14px' }}>★</span>
		))
	}

	return (
		<div className="home-page">
			<HomeNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="home-content">

					{/* Stats */}
					<div className="home-section">
						<h2 className="home-section-title">Your Stats</h2>
						<div className="home-stats">
							<div className="home-stat-card" onClick={() => setStatsModal('reviews')} style={{ cursor: 'pointer' }}>
								<span className="home-stat-number">{fakeStats.reviews}</span>
								<span className="home-stat-label">Reviews</span>
							</div>
							<div className="home-stat-card" onClick={() => setStatsModal('liked')} style={{ cursor: 'pointer' }}>
								<span className="home-stat-number">{fakeStats.liked}</span>
								<span className="home-stat-label">Liked games</span>
							</div>
							<div className="home-stat-card" onClick={() => setStatsModal('friends')} style={{ cursor: 'pointer' }}>
								<span className="home-stat-number">{fakeStats.friends}</span>
								<span className="home-stat-label">Friends</span>
							</div>
						</div>
					</div>

					{/* New releases + Highly praised */}
					<div className="home-section">
						<div className="home-highlights">
							<div className="home-highlight-card" onClick={() => navigate('/games?category=new-releases')}>
								<h2 className="home-section-title">New releases →</h2>
								<div className="home-highlight-grid">
									{newReleases.map((game, i) => (
										<div key={i} className="home-highlight-game" onClick={(e) => { e.stopPropagation(); navigate(`/game/${game.id}`) }}>
											<img src={game.image} alt={game.title} className="home-highlight-game-img" />
											<p className="home-highlight-game-title">{game.title}</p>
										</div>
									))}
								</div>
							</div>

							<div className="home-highlight-card" onClick={() => navigate('/games?category=highly-praised')}>
								<h2 className="home-section-title">Highly praised →</h2>
								<div className="home-highlight-grid">
									{highlyPraised.map((game, i) => (
										<div key={i} className="home-highlight-game" onClick={(e) => { e.stopPropagation(); navigate(`/game/${game.id}`) }}>
											<img src={game.image} alt={game.title} className="home-highlight-game-img" />
											<p className="home-highlight-game-title">{game.title}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Recently reviewed */}
					<div className="home-section">
						<h2 className="home-section-title">Recently reviewed</h2>
						<div className="home-reviews-grid">
							{fakeRecentReviews.map((review, i) => (
								<div key={i} className="home-review-card" onClick={() => navigate(`/game/${review.gameTitle}`)}>
									<img src={review.gameImage} alt={review.gameTitle} className="home-review-game-img" />
									<div className="home-review-info">
										<div className="home-review-header">
											<img src={review.avatar} alt={review.author} className="home-review-avatar" />
											<span className="home-review-author">{review.author}</span>
										</div>
										<p className="home-review-game">{review.gameTitle}</p>
										<p className="home-review-text">{review.text}</p>
										<div>{renderStars(review.rating)}</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Friends activity */}
					<div className="home-section">
						<h2 className="home-section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/friends')}>
							Your friends' activity →
						</h2>
						<div className="home-friends-grid">
							{fakeFriendsActivity.map((activity, i) => (
								<div key={i} className="home-friend-card">
									<img src={activity.avatar} alt={activity.username} className="home-friend-avatar" onClick={() => navigate('/profile')} />
									<div className="home-friend-info">
										<span className="home-friend-username" onClick={() => navigate('/profile')}>{activity.username}</span>
										<span className="home-friend-action"> {activity.action} </span>
										<span className="home-friend-game" onClick={() => navigate(`/game/${activity.gameTitle}`)}>{activity.gameTitle}</span>
									</div>
									<img src={activity.gameImage} alt={activity.gameTitle} className="home-friend-game-img" onClick={() => navigate(`/game/${activity.gameTitle}`)} />
								</div>
							))}
						</div>
					</div>

					{/* Popular this week */}
					<div className="home-section">
						<h2 className="home-section-title">Popular this week</h2>
						<div className="home-games-grid">
							{popular.map((game, i) => (
								<div key={i} className="home-game-card" onClick={() => navigate(`/game/${game.id}`)}>
									<img src={game.image} alt={game.title} className="home-game-img" />
									<p className="home-game-title">{game.title}</p>
								</div>
							))}
						</div>
					</div>

					{/* Coming soon */}
					<div className="home-section">
						<h2 className="home-section-title">Coming soon</h2>
						<div className="home-games-grid">
							{comingSoon.map((game, i) => (
								<div key={i} className="home-game-card" onClick={() => navigate(`/game/${game.id}`)}>
									<img src={game.image} alt={game.title} className="home-game-img" />
									<p className="home-game-title">{game.title}</p>
								</div>
							))}
						</div>
					</div>

					{/* Playing list */}
					<div className="home-section">
						<h2 className="home-section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
							Continue your playing list →
						</h2>
						<div className="home-games-grid">
							{fakePlayingList.map((game, i) => (
								<div key={i} className="home-game-card" onClick={() => navigate(`/game/${game.title}`)}>
									<img src={game.image} alt={game.title} className="home-game-img" />
									<p className="home-game-title">{game.title}</p>
								</div>
							))}
						</div>
					</div>

				</div>
			</Background>

			{/* Modals stats */}
			{statsModal && (
				<div className="home-modal-overlay" onClick={() => setStatsModal(null)}>
					<div className="home-modal" onClick={(e) => e.stopPropagation()}>
						<div className="home-modal-header">
							<h3 className="home-modal-title">
								{statsModal === 'reviews' && 'My Reviews'}
								{statsModal === 'liked' && 'Liked Games'}
								{statsModal === 'friends' && 'Friends'}
							</h3>
							<button className="home-modal-close" onClick={() => setStatsModal(null)}>✕</button>
						</div>

						{statsModal === 'reviews' && (
							<div className="home-modal-body">
								{fakeRecentReviews.map((review, i) => (
									<div key={i} className="home-modal-item" onClick={() => { navigate(`/game/${review.gameTitle}`); setStatsModal(null) }}>
										<img src={review.gameImage} alt={review.gameTitle} className="home-modal-img" />
										<div>
											<p className="home-modal-item-title">{review.gameTitle}</p>
											<p className="home-modal-item-text">{review.text}</p>
											<div>{renderStars(review.rating)}</div>
										</div>
									</div>
								))}
							</div>
						)}

						{statsModal === 'liked' && (
							<div className="home-modal-games-grid">
								{fakeLikedGames.map((game, i) => (
									<div key={i} className="home-modal-game-card" onClick={() => { navigate(`/game/${game.title}`); setStatsModal(null) }}>
										<img src={game.image} alt={game.title} className="home-modal-game-img" />
										<p className="home-modal-game-title">{game.title}</p>
									</div>
								))}
							</div>
						)}

						{statsModal === 'friends' && (
							<div className="home-modal-body">
								{fakeFriends.map((friend, i) => (
									<div key={i} className="home-modal-friend-item" onClick={() => { navigate('/profile'); setStatsModal(null) }}>
										<img src={friend.avatar} alt={friend.username} className="home-modal-friend-avatar" />
										<span className="home-modal-item-title">{friend.username}</span>
									</div>
								))}
							</div>
						)}

					</div>
				</div>
			)}
		</div>
	)
}

export default HomePage