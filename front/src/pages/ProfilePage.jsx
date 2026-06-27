import { useState, useEffect } from 'react'
import ProfileNavBar from '../components/ProfileNavBar'
import Background from '../components/Background'
import ProfileFavorites from '../components/ProfileFavorites'
import ProfileModal from '../components/ProfileModal'
import PostStars from '../components/PostStars'
import '../styles/ProfilePage.css'
import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiX } from 'react-icons/fi'

const fakeActivity = [
	{ type: "Commented", text: "Super review !", date: "04/25/26" },
	{ type: "Followed", text: "Brimbrim patapim", date: "04/24/26" },
	{ type: "Liked", text: "Review de Tuntung sahur", date: "04/23/26" },
]

const MAX_CHARS = 500

const ProfilePage = () => {
	const [modal, setModal] = useState(null)
	const [showAvatar, setShowAvatar] = useState(false)
	const [statsModal, setStatsModal] = useState(null)
	const [user, setUser] = useState(null)
	const navigate = useNavigate()
	const [likedGames, setLikedGames] = useState([])
	const [playingList, setPlayingList] = useState([])
	const [followers, setFollowers] = useState([])
	const [following, setFollowing] = useState([])
	const [reviews, setReviews] = useState([])

	// Edit modal
	const [editReview, setEditReview] = useState(null)
	const [editText, setEditText] = useState('')
	const [editRating, setEditRating] = useState(null)
	const [editStarsKey, setEditStarsKey] = useState(0)

	// Delete confirm
	const [deleteReviewId, setDeleteReviewId] = useState(null)

	useEffect(() => {
		const stored = localStorage.getItem('user')
		if (stored) {
			setUser(JSON.parse(stored))
		} else {
			navigate('/')
		}
	}, [navigate])

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return
		const headers = { Authorization: `Bearer ${token}` }

		fetch('/api/user/liked', { headers }).then(res => res.ok ? res.json() : []).then(data => setLikedGames(data)).catch(err => console.error(err))
		fetch('/api/user/playing', { headers }).then(res => res.ok ? res.json() : []).then(data => setPlayingList(data)).catch(err => console.error(err))
		fetch('/api/user/followers', { headers }).then(res => res.ok ? res.json() : []).then(data => setFollowers(data)).catch(err => console.error(err))
		fetch('/api/user/following', { headers }).then(res => res.ok ? res.json() : []).then(data => setFollowing(data)).catch(err => console.error(err))
		fetch('/api/user/reviews', { headers }).then(res => res.ok ? res.json() : []).then(data => setReviews(data)).catch(err => console.error(err))
	}, [])

	const renderStars = (ratingInt) => {
		const rating = ratingInt / 2 // ex: 7 → 3.5
		return [1, 2, 3, 4, 5].map((star) => {
			const full = rating >= star
			const half = !full && rating >= star - 0.5
			return (
				<span key={star} style={{
					fontSize: '16px',
					background: half
						? 'linear-gradient(90deg, #f5a623 50%, #555 50%)'
						: 'none',
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

	const openEdit = (review, e) => {
		e.stopPropagation()
		setEditReview(review)
		setEditText(review.reviewText || '')
		setEditRating(review.rating / 2)
		setEditStarsKey(k => k + 1)
	}

	const handleEditSubmit = async () => {
		if (!editRating) return
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/review/${editReview.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ rating: editRating, reviewText: editText })
			})
			const data = await res.json()
			if (!res.ok) return console.error(data.error)
			setReviews(prev => prev.map(r => r.id === editReview.id ? { ...r, rating: data.review.rating, reviewText: data.review.reviewText } : r))
			setEditReview(null)
		} catch (err) {
			console.error('Erreur edit review:', err)
		}
	}

	const handleDelete = async () => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/review/${deleteReviewId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			})
			if (!res.ok) return
			setReviews(prev => prev.filter(r => r.id !== deleteReviewId))
			setDeleteReviewId(null)
		} catch (err) {
			console.error('Erreur delete review:', err)
		}
	}

	const ReviewItem = ({ review, showActions = true }) => (
		<div className="modal-review-item" style={{ position: 'relative' }}>
			<img
				src={review.game.coverImageUrl || "https://placehold.co/80x110"}
				alt={review.game.title}
				className="modal-review-img"
				onClick={() => navigate(`/game/${review.game.idExterne}`)}
				style={{ cursor: 'pointer' }}
			/>
			<div style={{ flex: 1 }}>
				<p className="modal-review-game" onClick={() => navigate(`/game/${review.game.idExterne}`)} style={{ cursor: 'pointer' }}>{review.game.title}</p>
				<p className="modal-review-text">{review.reviewText || ''}</p>
				<div>{renderStars(review.rating)}</div>
				<p style={{ color: 'rgba(231,231,231,0.5)', fontSize: '11px', fontFamily: '"policeConthrax", sans-serif', marginTop: '4px' }}>
					{formatDate(review.createdAt)}
				</p>
			</div>
			{showActions && (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '10px' }}>
					<button onClick={(e) => openEdit(review, e)} style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer', transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
						<FiEdit2 size={16} />
					</button>
					<button onClick={(e) => { e.stopPropagation(); setDeleteReviewId(review.id) }} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
						<FiTrash2 size={16} />
					</button>
				</div>
			)}
		</div>
	)

	const avatarUrl = (user?.avatarUrl && user.avatarUrl !== 'default_avatar.png')
		? user.avatarUrl
		: "https://placehold.co/100x100"

	if (!user) return null

	return (
		<div className="profile-page">
			<ProfileNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="profile-content">

					<div className="profile-header">
						<img src={avatarUrl} alt="avatar" className="profile-avatar" onClick={() => setShowAvatar(true)} />
						<div className="profile-info">
							<h1 className="profile-username">{user.username}</h1>
							<div className="profile-stats">
								<div className="profile-stat" onClick={() => setStatsModal('followers')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{followers.length}</span>
									<span className="stat-label">Followers</span>
								</div>
								<div className="profile-stat" onClick={() => setStatsModal('following')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{following.length}</span>
									<span className="stat-label">Following</span>
								</div>
								<div className="profile-stat" onClick={() => setStatsModal('posts')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{reviews.length}</span>
									<span className="stat-label">Posts</span>
								</div>
							</div>
						</div>
					</div>

					<ProfileFavorites editable={true} />

					<div className="profile-reviews-section">
						<h2 className="profile-section-title">Reviews</h2>
						{reviews.length === 0 ? (
							<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>No reviews yet.</p>
						) : (
							reviews.slice(0, 2).map((review) => (
								<div key={review.id} className="profile-review-item" style={{ position: 'relative' }}>
									<img src={review.game.coverImageUrl || "https://placehold.co/80x110"} alt={review.game.title} className="profile-review-img" onClick={() => navigate(`/game/${review.game.idExterne}`)} style={{ cursor: 'pointer' }} />
									<div className="profile-review-info">
										<p className="profile-review-game">{review.game.title}</p>
										<p className="profile-review-text">{review.reviewText || ''}</p>
										<div>{renderStars(review.rating)}</div>
									</div>
									<div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
										<button onClick={(e) => openEdit(review, e)} style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer' }}>
											<FiEdit2 size={16} />
										</button>
										<button onClick={(e) => { e.stopPropagation(); setDeleteReviewId(review.id) }} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
											<FiTrash2 size={16} />
										</button>
									</div>
								</div>
							))
						)}
						{reviews.length > 2 && (
							<button className="profile-see-more-btn" onClick={() => setModal('reviews')}>See more</button>
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

			{/* Modal reviews */}
			{modal === 'reviews' && (
				<ProfileModal title="My Reviews" onClose={() => setModal(null)}>
					{reviews.map((review) => <ReviewItem key={review.id} review={review} />)}
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
							<p style={{ color: '#e7e7e7' }}>No games have been liked yet.</p>
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
							<p style={{ color: '#e7e7e7' }}>No games in progress.</p>
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
							<p style={{ color: '#e7e7e7' }}>No follower yet.</p>
						) : (
							followers.map((u) => (
								<div key={u.id} className="stats-user-item" onClick={() => navigate(`/profile/${u.id}`)}>
									<img src={u.avatarUrl && u.avatarUrl !== 'default_avatar.png' ? u.avatarUrl : "https://placehold.co/50x50"} alt={u.username} className="stats-user-avatar" />
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
							<p style={{ color: '#e7e7e7' }}>You follow no one yet.</p>
						) : (
							following.map((u) => (
								<div key={u.id} className="stats-user-item" onClick={() => navigate(`/profile/${u.id}`)}>
									<img src={u.avatarUrl && u.avatarUrl !== 'default_avatar.png' ? u.avatarUrl : "https://placehold.co/50x50"} alt={u.username} className="stats-user-avatar" />
									<span className="stats-user-name">{u.username}</span>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}

			{/* Modal posts */}
			{statsModal === 'posts' && (
				<ProfileModal title="Posts" onClose={() => setStatsModal(null)}>
					{reviews.length === 0 ? (
						<p style={{ color: '#e7e7e7' }}>No reviews yet.</p>
					) : (
						reviews.map((review) => <ReviewItem key={review.id} review={review} />)
					)}
				</ProfileModal>
			)}

			{/* Modal edit review */}
			{editReview && (
				<div className="settings-modal-overlay" onClick={() => setEditReview(null)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90vw' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
							<h3 className="settings-modal-title">Edit Review</h3>
							<button onClick={() => setEditReview(null)} style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer' }}>
								<FiX size={20} />
							</button>
						</div>
						<p style={{ color: '#f5a623', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', marginBottom: '15px' }}>
							{editReview.game.title}
						</p>
						<textarea
							style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(231,231,231,0.3)', borderRadius: '10px', color: '#e7e7e7', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', padding: '10px', resize: 'none', height: '120px', width: '100%', outline: 'none', marginBottom: '15px' }}
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							maxLength={MAX_CHARS}
							placeholder="Your review..."
						/>
						<p style={{ color: 'rgba(231,231,231,0.5)', fontSize: '11px', fontFamily: '"policeConthrax", sans-serif', textAlign: 'right', marginBottom: '15px' }}>
							{editText.length}/{MAX_CHARS}
						</p>
						<PostStars key={editStarsKey} onRate={setEditRating} />
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
							<button className="settings-cancel-btn" onClick={() => setEditReview(null)}>Cancel</button>
							<button className="settings-save-btn" onClick={handleEditSubmit}>Save</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal confirm delete */}
			{deleteReviewId && (
				<div className="settings-modal-overlay" onClick={() => setDeleteReviewId(null)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()}>
						<h3 className="settings-modal-title">Delete review ?</h3>
						<p className="settings-modal-text">This action is irreversible.</p>
						<div className="settings-modal-btns">
							<button className="settings-cancel-btn" onClick={() => setDeleteReviewId(null)}>Cancel</button>
							<button className="settings-confirm-danger-btn" onClick={handleDelete}>Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default ProfilePage