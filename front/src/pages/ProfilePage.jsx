import { useState, useEffect, useRef } from 'react'
import ProfileNavBar from '../components/ProfileNavBar'
import Background from '../components/Background'
import ProfileFavorites from '../components/ProfileFavorites'
import ProfileModal from '../components/ProfileModal'
import PostStars from '../components/PostStars'
import '../styles/ProfilePage.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiEdit2, FiTrash2, FiX, FiSettings } from 'react-icons/fi'
import Footer from '../components/Footer'

const MAX_CHARS = 500

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const ProfilePage = () => {
	const { t } = useTranslation()
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
	const [activity, setActivity] = useState([])
	const [editReview, setEditReview] = useState(null)
	const [editText, setEditText] = useState('')
	const [editRating, setEditRating] = useState(null)
	const [editStarsKey, setEditStarsKey] = useState(0)
	const [deleteReviewId, setDeleteReviewId] = useState(null)
	const reviewsSectionRef = useRef(null)
	const reviewItemRefs = useRef({})
	const location = useLocation()

	useEffect(() => {
		const stored = localStorage.getItem('user')
		if (stored) setUser(JSON.parse(stored))
		else navigate('/')
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
		fetch('/api/user/activity/' + JSON.parse(localStorage.getItem('user') || '{}').id, { headers })
			.then(res => res.ok ? res.json() : [])
			.then(data => setActivity(data))
			.catch(err => console.error(err))
	}, [])

	useEffect(() => {
		if (location.state?.openModal) setModal(location.state.openModal)
	}, [location.state])

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

	const renderStars = (ratingInt) => {
		const rating = ratingInt / 2
		return [1, 2, 3, 4, 5].map((star) => {
			const full = rating >= star
			const half = !full && rating >= star - 0.5
			return (
				<span key={star} style={{
					fontSize: '16px',
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
		<div className="modal-review-item" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleReviewClick(review.id)}>
			<img src={review.game.coverImageUrl || "https://placehold.co/80x110"} alt={review.game.title} className="modal-review-img"
				onClick={(e) => { e.stopPropagation(); navigate(`/game/${review.game.idExterne}`) }} style={{ cursor: 'pointer' }} />
			<div style={{ flex: 1 }}>
				<p className="modal-review-game">{review.game.title}</p>
				<p className="modal-review-text">{review.reviewText || ''}</p>
				<div>{renderStars(review.rating)}</div>
				<p style={{ color: 'rgba(231,231,231,0.5)', fontSize: '11px', fontFamily: '"policeConthrax", sans-serif', marginTop: '4px' }}>
					{formatDate(review.createdAt)}
				</p>
			</div>
			{showActions && (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '10px' }}>
					<button onClick={(e) => openEdit(review, e)} style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer', transition: 'transform 0.2s ease' }}
						onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
						onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
						<FiEdit2 size={16} />
					</button>
					<button onClick={(e) => { e.stopPropagation(); setDeleteReviewId(review.id) }} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', transition: 'transform 0.2s ease' }}
						onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
						onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
						<FiTrash2 size={16} />
					</button>
				</div>
			)}
		</div>
	)

	const avatarUrl = getAvatar(user?.avatarUrl, user?.username)
	if (!user) return null

	return (
		<div className="profile-page">
			<ProfileNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="profile-content">

					<div className="profile-header">
						<img src={avatarUrl} alt="avatar" className="profile-avatar" onClick={() => setShowAvatar(true)} />
						<div className="profile-info">
							<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
								<h1 className="profile-username">{user.username}</h1>
								<button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer', transition: 'transform 0.2s ease' }}
									onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
									onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
									<FiSettings size={20} />
								</button>
							</div>
							<div className="profile-stats">
								<div className="profile-stat" onClick={() => setStatsModal('followers')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{followers.length}</span>
									<span className="stat-label">{t('profile.followers')}</span>
								</div>
								<div className="profile-stat" onClick={() => setStatsModal('following')} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{following.length}</span>
									<span className="stat-label">{t('profile.following')}</span>
								</div>
								<div className="profile-stat" onClick={() => reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ cursor: 'pointer' }}>
									<span className="stat-number">{reviews.length}</span>
									<span className="stat-label">{t('profile.posts')}</span>
								</div>
							</div>
						</div>
					</div>

					<ProfileFavorites editable={true} />

					<div className="profile-reviews-section" ref={reviewsSectionRef}>
						<h2 className="profile-section-title">{t('profile.reviews')}</h2>
						{reviews.length === 0 ? (
							<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>{t('profile.no_reviews')}</p>
						) : (
							reviews.slice(0, 2).map((review) => (
								<div key={review.id} ref={el => reviewItemRefs.current[review.id] = el} className="profile-review-item" style={{ position: 'relative' }}>
									<img src={review.game.coverImageUrl || "https://placehold.co/80x110"} alt={review.game.title} className="profile-review-img"
										onClick={() => navigate(`/game/${review.game.idExterne}`)} style={{ cursor: 'pointer' }} />
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
							<button className="profile-see-more-btn" onClick={() => setModal('reviews')}>{t('profile.see_more')}</button>
						)}
					</div>

					<div className="profile-tabs">
						<button className="profile-tab-btn" onClick={() => setModal('activity')}>{t('profile.last_activity')}</button>
						<button className="profile-tab-btn" onClick={() => setModal('likes')}>{t('profile.likes')}</button>
						<button className="profile-tab-btn" onClick={() => setModal('playinglist')}>{t('profile.playing_list')}</button>
					</div>

				</div>
			</Background>

			{showAvatar && (
				<div className="avatar-modal-overlay" onClick={() => setShowAvatar(false)}>
					<img src={avatarUrl} alt="avatar" className="avatar-modal-img" />
				</div>
			)}

			{modal === 'reviews' && (
				<ProfileModal title={t('profile.my_reviews')} onClose={() => setModal(null)}>
					{reviews.map((review) => <ReviewItem key={review.id} review={review} />)}
				</ProfileModal>
			)}

			{modal === 'activity' && (
				<ProfileModal title={t('profile.last_activity')} onClose={() => setModal(null)}>
					{activity.length === 0 ? (
						<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px' }}>
							{t('profile.no_activity')}
						</p>
					) : (
						activity.map((a, i) => (
							<div key={i} className="modal-activity-item" style={{ cursor: 'pointer' }}
								onClick={() => {
									if (a.type === 'reviewed' && a.reviewId) { navigate('/reviews', { state: { tab: 'mine', reviewId: a.reviewId } }); setModal(null) }
									else if (a.type === 'liked' || a.type === 'playing') { navigate(`/game/${a.targetId}`); setModal(null) }
									else if (a.type === 'followed') { navigate(`/profile/${a.targetId}`); setModal(null) }
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
				<ProfileModal title={t('profile.likes')} onClose={() => setModal(null)}>
					<div className="modal-games-grid">
						{likedGames.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>{t('profile.no_liked')}</p>
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
				<ProfileModal title={t('profile.playing_list')} onClose={() => setModal(null)}>
					<div className="modal-games-grid">
						{playingList.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>{t('profile.no_playing')}</p>
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
				<ProfileModal title={t('profile.followers')} onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{followers.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>{t('profile.no_follower')}</p>
						) : (
							followers.map((u) => (
								<div key={u.id} className="stats-user-item" style={{ justifyContent: 'space-between' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={() => navigate(`/profile/${u.id}`)}>
										<img src={getAvatar(u.avatarUrl, u.username)} alt={u.username} className="stats-user-avatar" />
										<span className="stats-user-name">{u.username}</span>
									</div>
									<button onClick={async () => {
										const token = localStorage.getItem('token')
										const res = await fetch(`/api/user/follower/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
										if (res.ok) setFollowers(prev => prev.filter(f => f.id !== u.id))
									}} style={{ background: 'none', border: '1px solid #f44336', color: '#f44336', borderRadius: '20px', padding: '4px 12px', fontFamily: '"policeConthrax", sans-serif', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
										{t('profile.remove')}
									</button>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}

			{statsModal === 'following' && (
				<ProfileModal title={t('profile.following')} onClose={() => setStatsModal(null)}>
					<div className="stats-users-list">
						{following.length === 0 ? (
							<p style={{ color: '#e7e7e7' }}>{t('profile.no_following')}</p>
						) : (
							following.map((u) => (
								<div key={u.id} className="stats-user-item" style={{ justifyContent: 'space-between' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={() => navigate(`/profile/${u.id}`)}>
										<img src={getAvatar(u.avatarUrl, u.username)} alt={u.username} className="stats-user-avatar" />
										<span className="stats-user-name">{u.username}</span>
									</div>
									<button onClick={async () => {
										const token = localStorage.getItem('token')
										const res = await fetch(`/api/user/follow/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
										if (res.ok) setFollowing(prev => prev.filter(f => f.id !== u.id))
									}} style={{ background: 'none', border: '1px solid #f44336', color: '#f44336', borderRadius: '20px', padding: '4px 12px', fontFamily: '"policeConthrax", sans-serif', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
										{t('profile.unfollow')}
									</button>
								</div>
							))
						)}
					</div>
				</ProfileModal>
			)}

			{editReview && (
				<div className="settings-modal-overlay" onClick={() => setEditReview(null)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90vw' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
							<h3 className="settings-modal-title">{t('profile.edit_review')}</h3>
							<button onClick={() => setEditReview(null)} style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer' }}>
								<FiX size={20} />
							</button>
						</div>
						<p style={{ color: '#f5a623', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', marginBottom: '15px' }}>
							{editReview.game.title}
						</p>
						<textarea
							style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(231,231,231,0.3)', borderRadius: '10px', color: '#e7e7e7', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', padding: '10px', resize: 'none', height: '120px', width: '100%', outline: 'none', marginBottom: '15px' }}
							value={editText} onChange={(e) => setEditText(e.target.value)} maxLength={MAX_CHARS} placeholder={t('profile.your_review')}
						/>
						<p style={{ color: 'rgba(231,231,231,0.5)', fontSize: '11px', fontFamily: '"policeConthrax", sans-serif', textAlign: 'right', marginBottom: '15px' }}>
							{editText.length}/{MAX_CHARS}
						</p>
						<PostStars key={editStarsKey} onRate={setEditRating} />
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
							<button className="settings-cancel-btn" onClick={() => setEditReview(null)}>{t('profile.cancel')}</button>
							<button className="settings-save-btn" onClick={handleEditSubmit}>{t('profile.save')}</button>
						</div>
					</div>
				</div>
			)}

			{deleteReviewId && (
				<div className="settings-modal-overlay" onClick={() => setDeleteReviewId(null)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()}>
						<h3 className="settings-modal-title">{t('profile.delete_review')}</h3>
						<p className="settings-modal-text">{t('profile.irreversible')}</p>
						<div className="settings-modal-btns">
							<button className="settings-cancel-btn" onClick={() => setDeleteReviewId(null)}>{t('profile.cancel')}</button>
							<button className="settings-confirm-danger-btn" onClick={handleDelete}>{t('profile.delete')}</button>
						</div>
					</div>
				</div>
			)}
			<Footer />
		</div>
	)
}

export default ProfilePage