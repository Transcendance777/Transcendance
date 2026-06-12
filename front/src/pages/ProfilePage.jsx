import { useState } from 'react'
import ProfileNavBar from '../components/ProfileNavBar'
import Background from '../components/Background'
import ProfileFavorites from '../components/ProfileFavorites'
import ProfileModal from '../components/ProfileModal'
import '../styles/ProfilePage.css'
import { useNavigate } from 'react-router-dom'

const fakeUser = {
	username: "xX_DarkWolf_Xx",
	avatar: "https://placehold.co/100x100",
	followers: 142,
	following: 87,
	posts: 34,
}

const fakeFavorites = Array.from({ length: 4 }, (_, i) => ({
	title: `Jeu ${i + 1}`,
	image: "https://placehold.co/160x220"
}))

const fakeReviews = Array.from({ length: 5 }, (_, i) => ({
	gameTitle: `Jeu ${i + 1}`,
	gameImage: "https://placehold.co/80x110",
	text: "Super jeu, je recommande vraiment...",
	rating: Math.floor(Math.random() * 5) + 1,
	date: "04/25/26"
}))

const fakeActivity = [
	{ type: "Commented", text: "Super review !", date: "04/25/26" },
	{ type: "Followed", text: "Brimbrim patapim", date: "04/24/26" },
	{ type: "Liked", text: "Review de Tuntung sahur", date: "04/23/26" },
]

const fakeLikedGames = Array.from({ length: 6 }, (_, i) => ({
	title: `Jeu ${i + 1}`,
	image: "https://placehold.co/100x140"
}))

const fakePlayingList = Array.from({ length: 6 }, (_, i) => ({
	title: `Jeu ${i + 1}`,
	image: "https://placehold.co/100x140"
}))

const ProfilePage = () => {
	const [modal, setModal] = useState(null)
	const [showAvatar, setShowAvatar] = useState(false)
	const [statsModal, setStatsModal] = useState(null)
	const navigate = useNavigate()

	const renderStars = (rating) => {
		return [1, 2, 3, 4, 5].map((star) => (
			<span key={star} style={{ color: rating >= star ? '#f5a623' : '#555', fontSize: '16px' }}>★</span>
		))
	}

	const fakeFollowers = Array.from({ length: 8 }, (_, i) => ({
		username: `User${i + 1}`,
		avatar: "https://placehold.co/50x50"
	}))

	const fakeFollowing = Array.from({ length: 5 }, (_, i) => ({
		username: `User${i + 10}`,
		avatar: "https://placehold.co/50x50"
	}))

	return (
		<div className="profile-page">
			<ProfileNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="profile-content">

					{/* Header profil */}
					<div className="profile-header">
						<img
							src={fakeUser.avatar}
							alt="avatar"
							className="profile-avatar"
							onClick={() => setShowAvatar(true)}
						/>
						<div className="profile-info">
							<h1 className="profile-username">{fakeUser.username}</h1>
							<div className="profile-stats">
								<div className="profile-stat" onClick={() => setStatsModal('followers')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{fakeUser.followers}</span>
									<span className="stat-label">Followers</span>
								</div>
								<div className="profile-stat" onClick={() => setStatsModal('following')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{fakeUser.following}</span>
									<span className="stat-label">Following</span>
								</div>
								<div className="profile-stat" onClick={() => setStatsModal('posts')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{fakeUser.posts}</span>
									<span className="stat-label">Posts</span>
								</div>
							</div>
						</div>
					</div>

					{/* Jeux favoris */}
					<ProfileFavorites games={fakeFavorites} />

					{/* Reviews */}
					<div className="profile-reviews-section">
						<h2 className="profile-section-title">Reviews</h2>
						{fakeReviews.slice(0, 2).map((review, i) => (
							<div key={i} className="profile-review-item" onClick={() => navigate(`/game/${review.gameTitle}`)} style={{ cursor: 'pointer' }}>
								<img src={review.gameImage} alt={review.gameTitle} className="profile-review-img" />
								<div className="profile-review-info">
									<p className="profile-review-game">{review.gameTitle}</p>
									<p className="profile-review-text">{review.text}</p>
									<div>{renderStars(review.rating)}</div>
								</div>
							</div>
						))}
						<button className="profile-see-more-btn" onClick={() => setModal('reviews')}>See more</button>
					</div>

					{/* Boutons onglets */}
					<div className="profile-tabs">
						<button className="profile-tab-btn" onClick={() => setModal('activity')}>Last Activity</button>
						<button className="profile-tab-btn" onClick={() => setModal('likes')}>Likes</button>
						<button className="profile-tab-btn" onClick={() => setModal('playinglist')}>Playing List</button>
					</div>

				</div>
			</Background>
			
			{showAvatar && (
				<div className="avatar-modal-overlay" onClick={() => setShowAvatar(false)}>
					<img src={fakeUser.avatar} alt="avatar" className="avatar-modal-img" />
				</div>
			)}
			
			{/* Modals */}
			{modal === 'reviews' && (
				<ProfileModal title="My Reviews" onClose={() => setModal(null)}>
					{fakeReviews.map((review, i) => (
						<div key={i} className="modal-review-item" onClick={() => navigate(`/game/${review.gameTitle}`)} style={{ cursor: 'pointer' }}>
							<img src={review.gameImage} alt={review.gameTitle} className="modal-review-img" />
							<div>
								<p className="modal-review-game">{review.gameTitle}</p>
								<p className="modal-review-text">{review.text}</p>
								<div>{renderStars(review.rating)}</div>
							</div>
						</div>
					))}
				</ProfileModal>
			)}

			{modal === 'activity' && (
				<ProfileModal title="Last Activity" onClose={() => setModal(null)}>
					{fakeActivity.map((activity, i) => (
						<div key={i} className="modal-activity-item">
							<span className="modal-activity-type">{activity.type}</span>
							<span className="modal-activity-text">{activity.text}</span>
							<span className="modal-activity-date">{activity.date}</span>
						</div>
					))}
				</ProfileModal>
			)}

			{modal === 'likes' && (
				<ProfileModal title="Liked Games" onClose={() => setModal(null)}>
					<div className="modal-games-grid">
						{fakeLikedGames.map((game, i) => (
							<div key={i} className="modal-game-card" onClick={() => navigate(`/game/${game.title}`)}>
								<img src={game.image} alt={game.title} className="modal-game-img" />
								<p className="modal-game-title">{game.title}</p>
							</div>
						))}
					</div>
				</ProfileModal>
			)}

			{modal === 'playinglist' && (
				<ProfileModal title="Playing List" onClose={() => setModal(null)}>
					<div className="modal-games-grid">
						{fakePlayingList.map((game, i) => (
							<div key={i} className="modal-game-card" onClick={() => navigate(`/game/${game.title}`)}>
								<img src={game.image} alt={game.title} className="modal-game-img" />
								<p className="modal-game-title">{game.title}</p>
							</div>
						))}
					</div>
				</ProfileModal>
			)}

			{statsModal === 'followers' && (
				<ProfileModal title="Followers" onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{fakeFollowers.map((user, i) => (
							<div key={i} className="stats-user-item" onClick={() => navigate('/profile')}>
								<img src={user.avatar} alt={user.username} className="stats-user-avatar" />
								<span className="stats-user-name">{user.username}</span>
							</div>
						))}
					</div>
				</ProfileModal>
			)}

			{statsModal === 'following' && (
				<ProfileModal title="Following" onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{fakeFollowing.map((user, i) => (
							<div key={i} className="stats-user-item" onClick={() => navigate('/profile')}>
								<img src={user.avatar} alt={user.username} className="stats-user-avatar" />
								<span className="stats-user-name">{user.username}</span>
							</div>
						))}
					</div>
				</ProfileModal>
			)}

			{statsModal === 'posts' && (
				<ProfileModal title="Posts" onClose={() => setStatsModal(null)}>
					{fakeReviews.map((review, i) => (
						<div key={i} className="modal-review-item">
							<img src={review.gameImage} alt={review.gameTitle} className="modal-review-img" />
							<div>
								<p className="modal-review-game">{review.gameTitle}</p>
								<p className="modal-review-text">{review.text}</p>
								<div>{renderStars(review.rating)}</div>
							</div>
						</div>
					))}
				</ProfileModal>
			)}
		</div>
	)
}

export default ProfilePage