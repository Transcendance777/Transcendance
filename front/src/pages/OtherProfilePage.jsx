import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProfileNavBar from '../components/ProfileNavBar'
import Background from '../components/Background'
import ProfileModal from '../components/ProfileModal'
import ProfileFavorites from '../components/ProfileFavorites'
import ReviewsCard from '../components/ReviewsCard'
import '../styles/ProfilePage.css'

const fakeActivity = [
	{ type: "Commented", text: "Super review !", date: "04/25/26" },
	{ type: "Followed", text: "Brimbrim patapim", date: "04/24/26" },
	{ type: "Liked", text: "Review de Tuntung sahur", date: "04/23/26" },
]

const OtherProfilePage = () => {
	const { userId } = useParams()
	const navigate = useNavigate()
	const [profileUser, setProfileUser] = useState(null)
	const [followers, setFollowers] = useState([])
	const [following, setFollowing] = useState([])
	const [likedGames, setLikedGames] = useState([])
	const [playingList, setPlayingList] = useState([])
	const [reviews, setReviews] = useState([])
	const [modal, setModal] = useState(null)
	const [statsModal, setStatsModal] = useState(null)
	const [showAvatar, setShowAvatar] = useState(false)
	const [loading, setLoading] = useState(true)
	const [favoriteGames, setFavoriteGames] = useState([])

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return navigate('/')

		fetch(`/api/user/profile/${userId}`, {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(res => res.ok ? res.json() : null)
			.then(data => {
				if (!data) return navigate('/home')
				const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
				if (data.user.id === currentUser.id) return navigate('/profile')
				setProfileUser(data.user)
				setFollowers(data.followers)
				setFollowing(data.following)
				setLikedGames(data.likedGames || [])
				setPlayingList(data.playingList || [])
				setFavoriteGames(data.favoriteGames || [])
				setReviews(data.reviews || [])
				setLoading(false)
			})
			.catch(err => {
				console.error('Erreur profil:', err)
				navigate('/home')
			})
	}, [userId, navigate])

	const formatDate = (dateStr) => {
		const d = new Date(dateStr)
		return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
	}

	const avatarUrl = (profileUser?.avatarUrl && profileUser.avatarUrl !== 'default_avatar.png')
		? profileUser.avatarUrl
		: "https://placehold.co/100x100"

	if (loading) return null

	return (
		<div className="profile-page">
			<ProfileNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="profile-content">

					{/* Header profil */}
					<div className="profile-header">
						<img
							src={avatarUrl}
							alt="avatar"
							className="profile-avatar"
							onClick={() => setShowAvatar(true)}
						/>
						<div className="profile-info">
							<h1 className="profile-username">{profileUser.username}</h1>
							<div className="profile-stats">
								<div className="profile-stat" onClick={() => setStatsModal('followers')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{followers.length}</span>
									<span className="stat-label">Followers</span>
								</div>
								<div className="profile-stat" onClick={() => setStatsModal('following')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{following.length}</span>
									<span className="stat-label">Following</span>
								</div>
								<div className="profile-stat">
									<span className="stat-number">{reviews.length}</span>
									<span className="stat-label">Posts</span>
								</div>
							</div>
						</div>
					</div>

					{/* Jeux favoris */}
					<ProfileFavorites editable={false} externalFavorites={favoriteGames} />

					{/* Reviews */}
					<div className="profile-reviews-section">
						<h2 className="profile-section-title">Reviews</h2>
						{reviews.length === 0 ? (
							<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>
								No reviews yet.
							</p>
						) : (
							<>
								{reviews.slice(0, 2).map((review) => (
									<ReviewsCard key={review.id} review={{
										id: review.id,
										author: profileUser.username,
										authorId: profileUser.id,
										authorAvatar: profileUser.avatarUrl,
										gameTitle: review.game.title,
										gameImage: review.game.coverImageUrl || "https://placehold.co/160x220",
										gameId: review.game.idExterne,
										text: review.reviewText || '',
										rating: review.rating / 2,
										date: formatDate(review.createdAt)
									}} />
								))}
								{reviews.length > 2 && (
									<button className="profile-see-more-btn" onClick={() => setModal('reviews')}>See more</button>
								)}
							</>
						)}
					</div>

					{/* Boutons onglets */}
					<div className="profile-tabs">
						<button className="profile-tab-btn" onClick={() => setModal('activity')}>Last Activity</button>
						<button className="profile-tab-btn" onClick={() => setModal('likes')}>Likes</button>
						<button className="profile-tab-btn" onClick={() => setModal('playinglist')}>Playing List</button>
					</div>

				</div>
			</Background>

			{/* Zoom avatar */}
			{showAvatar && (
				<div className="avatar-modal-overlay" onClick={() => setShowAvatar(false)}>
					<img src={avatarUrl} alt="avatar" className="avatar-modal-img" />
				</div>
			)}

			{/* Modal reviews */}
			{modal === 'reviews' && (
				<ProfileModal title="Reviews" onClose={() => setModal(null)}>
					{reviews.map((review) => (
						<ReviewsCard key={review.id} review={{
							id: review.id,
							author: profileUser.username,
							authorId: profileUser.id,
							authorAvatar: profileUser.avatarUrl,
							gameTitle: review.game.title,
							gameImage: review.game.coverImageUrl || "https://placehold.co/160x220",
							gameId: review.game.idExterne,
							text: review.reviewText || '',
							rating: review.rating / 2,
							date: formatDate(review.createdAt)
						}} />
					))}
				</ProfileModal>
			)}

			{/* Modal activity */}
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

			{/* Modal likes */}
			{modal === 'likes' && (
				<ProfileModal title="Liked Games" onClose={() => setModal(null)}>
					<div className="modal-games-grid">
						{likedGames.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>No game has been liked yet.</p>
						) : (
							likedGames.map((game) => (
								<div key={game.id} className="modal-game-card" onClick={() => navigate(`/game/${game.idExterne}`)}>
									<img src={game.coverImageUrl || "https://placehold.co/100x140"} alt={game.title} className="modal-game-img" />
									<p className="modal-game-title">{game.title}</p>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}

			{/* Modal playing list */}
			{modal === 'playinglist' && (
				<ProfileModal title="Playing List" onClose={() => setModal(null)}>
					<div className="modal-games-grid">
						{playingList.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>No game in progress.</p>
						) : (
							playingList.map((game) => (
								<div key={game.id} className="modal-game-card" onClick={() => navigate(`/game/${game.idExterne}`)}>
									<img src={game.coverImageUrl || "https://placehold.co/100x140"} alt={game.title} className="modal-game-img" />
									<p className="modal-game-title">{game.title}</p>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}

			{/* Modal followers */}
			{statsModal === 'followers' && (
				<ProfileModal title="Followers" onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{followers.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>No follower.</p>
						) : (
							followers.map((u) => (
								<div key={u.id} className="stats-user-item" onClick={() => navigate(`/profile/${u.id}`)}>
									<img
										src={u.avatarUrl && u.avatarUrl !== 'default_avatar.png' ? u.avatarUrl : "https://placehold.co/50x50"}
										alt={u.username}
										className="stats-user-avatar"
									/>
									<span className="stats-user-name">{u.username}</span>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}

			{/* Modal following */}
			{statsModal === 'following' && (
				<ProfileModal title="Following" onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{following.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>Follows nobody.</p>
						) : (
							following.map((u) => (
								<div key={u.id} className="stats-user-item" onClick={() => navigate(`/profile/${u.id}`)}>
									<img
										src={u.avatarUrl && u.avatarUrl !== 'default_avatar.png' ? u.avatarUrl : "https://placehold.co/50x50"}
										alt={u.username}
										className="stats-user-avatar"
									/>
									<span className="stats-user-name">{u.username}</span>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}
		</div>
	)
}

export default OtherProfilePage