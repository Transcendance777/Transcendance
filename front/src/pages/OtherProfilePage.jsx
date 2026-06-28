import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProfileNavBar from '../components/ProfileNavBar'
import Background from '../components/Background'
import ProfileModal from '../components/ProfileModal'
import ProfileFavorites from '../components/ProfileFavorites'
import ReviewsCard from '../components/ReviewsCard'
import { FiUserPlus, FiCheck, FiUserMinus } from 'react-icons/fi'
import '../styles/ProfilePage.css'
import Footer from '../components/Footer'

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

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
	const [isFollowing, setIsFollowing] = useState(false)
	const [activity, setActivity] = useState([])
	const reviewsSectionRef = useRef(null)
	const [hoverUnfollow, setHoverUnfollow] = useState(false)
	const reviewItemRefs = useRef({})

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return navigate('/')

		Promise.all([
			fetch(`/api/user/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.ok ? res.json() : null),
			fetch('/api/user/following', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.ok ? res.json() : []),
			fetch(`/api/user/activity/${userId}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.ok ? res.json() : [])
		])
			.then(([data, followingList, activityData]) => {
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
				setIsFollowing(followingList.some(u => u.id === parseInt(userId)))
				setActivity(activityData || [])
				setLoading(false)
			})
			.catch(err => {
				console.error('Erreur profil:', err)
				navigate('/home')
			})
	}, [userId, navigate])

	const handleFollow = async () => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/friend-request/${userId}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!res.ok) return
			setIsFollowing(true)
		} catch (err) {
			console.error('Erreur follow:', err)
		}
	}

	const handleReviewClick = (reviewId) => {
		setModal(null)
		setStatsModal(null)
		setTimeout(() => {
			reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
			const el = reviewItemRefs.current[reviewId]
			if (el) {
				el.style.outline = '2px solid #f5a623'
				el.style.borderRadius = '8px'
				setTimeout(() => { el.style.outline = 'none' }, 2000)
			}
		}, 100)
	}

	const formatDate = (dateStr) => {
		const d = new Date(dateStr)
		return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`
	}

	const avatarUrl = getAvatar(profileUser?.avatarUrl, profileUser?.username)

	if (loading) return null

	return (
		<div className="profile-page">
			<ProfileNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="profile-content">

					<div className="profile-header">
						<img src={avatarUrl} alt="avatar" className="profile-avatar" onClick={() => setShowAvatar(true)} />
						<div className="profile-info">
							<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
								<h1 className="profile-username">{profileUser.username}</h1>
								<button
									onClick={isFollowing ? async () => {
										const token = localStorage.getItem('token')
										const res = await fetch(`/api/user/follow/${userId}`, {
											method: 'DELETE',
											headers: { Authorization: `Bearer ${token}` }
										})
										if (res.ok) setIsFollowing(false)
									} : handleFollow}
									title={isFollowing ? 'Unfollow' : 'Follow'}
									style={{
										background: 'none',
										border: `2px solid ${isFollowing ? '#4caf50' : 'rgba(231,231,231,0.4)'}`,
										borderRadius: '50%',
										width: '36px',
										height: '36px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										color: isFollowing ? '#4caf50' : '#e7e7e7',
										transition: 'border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
										flexShrink: 0
									}}
									onMouseEnter={e => {
										e.currentTarget.style.transform = 'scale(1.1)'
										if (isFollowing) {
											e.currentTarget.style.borderColor = '#f44336'
											e.currentTarget.style.color = '#f44336'
											setHoverUnfollow(true)
										}
									}}
									onMouseLeave={e => {
										e.currentTarget.style.transform = 'scale(1)'
										if (isFollowing) {
											e.currentTarget.style.borderColor = '#4caf50'
											e.currentTarget.style.color = '#4caf50'
											setHoverUnfollow(false)
										}
									}}
								>
									{isFollowing
										? (hoverUnfollow ? <FiUserMinus size={16} /> : <FiCheck size={16} />)
										: <FiUserPlus size={16} />
									}
								</button>
							</div>
							<div className="profile-stats">
								<div className="profile-stat" onClick={() => setStatsModal('followers')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{followers.length}</span>
									<span className="stat-label">Followers</span>
								</div>
								<div className="profile-stat" onClick={() => setStatsModal('following')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{following.length}</span>
									<span className="stat-label">Following</span>
								</div>
								<div className="profile-stat" onClick={() => {
									reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
								}} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{reviews.length}</span>
									<span className="stat-label">Posts</span>
								</div>
							</div>
						</div>
					</div>

					<ProfileFavorites editable={false} externalFavorites={favoriteGames} />

					<div className="profile-reviews-section" ref={reviewsSectionRef}>
						<h2 className="profile-section-title">Reviews</h2>
						{reviews.length === 0 ? (
							<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>
								No reviews yet.
							</p>
						) : (
							<>
								{reviews.slice(0, 2).map((review) => (
									<div key={review.id} ref={el => reviewItemRefs.current[review.id] = el}>
										<ReviewsCard review={{
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
									</div>
								))}
								{reviews.length > 2 && (
									<button className="profile-see-more-btn" onClick={() => setModal('reviews')}>See more</button>
								)}
							</>
						)}
					</div>

					<div className="profile-tabs">
						<button className="profile-tab-btn" onClick={() => setModal('activity')}>Last Activity</button>
						<button className="profile-tab-btn" onClick={() => setModal('likes')}>Likes</button>
						<button className="profile-tab-btn" onClick={() => setModal('playinglist')}>Playing List</button>
					</div>

				</div>
			</Background>

			{showAvatar && (
				<div className="avatar-modal-overlay" onClick={() => setShowAvatar(false)}>
					<img src={avatarUrl} alt="avatar" className="avatar-modal-img" />
				</div>
			)}

			{modal === 'reviews' && (
				<ProfileModal title="Reviews" onClose={() => setModal(null)}>
					{reviews.map((review) => (
						<div key={review.id} className="modal-review-item" style={{ cursor: 'pointer' }} onClick={() => handleReviewClick(review.id)}>
							<img
								src={review.game.coverImageUrl || "https://placehold.co/80x110"}
								alt={review.game.title}
								className="modal-review-img"
								onClick={(e) => { e.stopPropagation(); navigate(`/game/${review.game.idExterne}`) }}
								style={{ cursor: 'pointer' }}
							/>
							<div style={{ flex: 1 }}>
								<p className="modal-review-game">{review.game.title}</p>
								<p className="modal-review-text">{review.reviewText || ''}</p>
								<div>{[1, 2, 3, 4, 5].map(star => {
									const r = review.rating / 2
									const full = r >= star
									const half = !full && r >= star - 0.5
									return <span key={star} style={{ fontSize: '14px', background: half ? 'linear-gradient(90deg, #f5a623 50%, #555 50%)' : 'none', WebkitBackgroundClip: half ? 'text' : 'none', WebkitTextFillColor: half ? 'transparent' : (full ? '#f5a623' : '#555'), color: full ? '#f5a623' : '#555' }}>★</span>
								})}</div>
								<p style={{ color: 'rgba(231,231,231,0.5)', fontSize: '11px', fontFamily: '"policeConthrax", sans-serif', marginTop: '4px' }}>
									{formatDate(review.createdAt)}
								</p>
							</div>
						</div>
					))}
				</ProfileModal>
			)}

			{modal === 'activity' && (
				<ProfileModal title="Last Activity" onClose={() => setModal(null)}>
					{activity.length === 0 ? (
						<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>
							No activity yet.
						</p>
					) : (
						activity.map((a, i) => (
							<div key={i} className="modal-activity-item" style={{ cursor: 'pointer' }}
								onClick={() => {
									if (a.type === 'reviewed' && a.reviewId) {
										navigate('/reviews', { state: { tab: 'users', reviewId: a.reviewId } })
										setModal(null)
									} else if (a.type === 'liked' || a.type === 'playing') {
										navigate(`/game/${a.targetId}`)
										setModal(null)
									} else if (a.type === 'followed') {
										navigate(`/profile/${a.targetId}`)
										setModal(null)
									}
								}}
							>
								<span className="modal-activity-type">
									{a.type === 'liked' ? '❤️' : a.type === 'reviewed' ? '⭐' : a.type === 'playing' ? '🎮' : '👤'}
								</span>
								<span className="modal-activity-text">{a.action} <strong>{a.target}</strong></span>
								<span className="modal-activity-date">{new Date(a.date).toLocaleDateString('en-US')}</span>
							</div>
						))
					)}
				</ProfileModal>
			)}

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

			{statsModal === 'followers' && (
				<ProfileModal title="Followers" onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{followers.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>No follower.</p>
						) : (
							followers.map((u) => (
								<div key={u.id} className="stats-user-item" onClick={() => navigate(`/profile/${u.id}`)}>
									<img src={getAvatar(u.avatarUrl, u.username)} alt={u.username} className="stats-user-avatar" />
									<span className="stats-user-name">{u.username}</span>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}

			{statsModal === 'following' && (
				<ProfileModal title="Following" onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{following.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>Follows nobody.</p>
						) : (
							following.map((u) => (
								<div key={u.id} className="stats-user-item" onClick={() => navigate(`/profile/${u.id}`)}>
									<img src={getAvatar(u.avatarUrl, u.username)} alt={u.username} className="stats-user-avatar" />
									<span className="stats-user-name">{u.username}</span>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}
			<Footer />
		</div>
	)
}

export default OtherProfilePage