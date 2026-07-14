import '../styles/ReviewsCard.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiCornerDownRight, FiThumbsUp, FiThumbsDown, FiTrash2, FiEdit2, FiX } from 'react-icons/fi'
import PostStars from './PostStars'

const MAX_REPLY = 200
const MAX_CHARS = 500

const ReviewsCard = ({ review, isOwn = false, onReviewUpdated = null, onReviewDeleted = null }) => {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const [userType, setUserType] = useState(null)
	const [likes, setLikes] = useState(0)
	const [dislikes, setDislikes] = useState(0)
	const [showReply, setShowReply] = useState(false)
	const [reply, setReply] = useState('')
	const [comments, setComments] = useState([])
	const [replyingTo, setReplyingTo] = useState(null)
	const [subReply, setSubReply] = useState('')
	const [showEdit, setShowEdit] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [editText, setEditText] = useState(review.text || '')
	const [editRating, setEditRating] = useState(null)
	const [editStarsKey, setEditStarsKey] = useState(0)

	const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
	const token = localStorage.getItem('token')
	const headers = { Authorization: `Bearer ${token}` }

	useEffect(() => {
		Promise.all([
			fetch(`/api/user/review/${review.id}/likes`, { headers }).then(res => res.ok ? res.json() : null),
			fetch(`/api/user/review/${review.id}/comments`, { headers }).then(res => res.ok ? res.json() : [])
		]).then(([likesData, commentsData]) => {
			if (likesData) {
				setLikes(likesData.likes)
				setDislikes(likesData.dislikes)
				setUserType(likesData.userType)
			}
			setComments(commentsData)
		}).catch(err => console.error('Erreur init:', err))
	}, [review.id])

	const handleLikeDislike = async (type) => {
		try {
			const res = await fetch(`/api/user/review/${review.id}/like`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ type })
			})
			if (!res.ok) return
			const data = await res.json()
			if (data.type === null) {
				if (type === 'like') setLikes(l => l - 1)
				else setDislikes(d => d - 1)
				setUserType(null)
			} else if (userType && userType !== type) {
				if (type === 'like') { setLikes(l => l + 1); setDislikes(d => d - 1) }
				else { setDislikes(d => d + 1); setLikes(l => l - 1) }
				setUserType(type)
			} else {
				if (type === 'like') setLikes(l => l + 1)
				else setDislikes(d => d + 1)
				setUserType(type)
			}
		} catch (err) {
			console.error('Erreur like/dislike:', err)
		}
	}

	const handleReplySubmit = async () => {
		if (reply.trim() === '') return
		try {
			const res = await fetch(`/api/user/review/${review.id}/comment`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: reply })
			})
			if (!res.ok) return
			const data = await res.json()
			setComments(prev => [...prev, { ...data, replies: [] }])
			setReply('')
		} catch (err) {
			console.error('Erreur comment:', err)
		}
	}

	const handleSubReplySubmit = async (parentId) => {
		if (subReply.trim() === '') return
		try {
			const res = await fetch(`/api/user/review/${review.id}/comment`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: subReply, parentId })
			})
			if (!res.ok) return
			const data = await res.json()
			setComments(prev => prev.map(c =>
				c.id === parentId ? { ...c, replies: [...(c.replies || []), data] } : c
			))
			setSubReply('')
			setReplyingTo(null)
		} catch (err) {
			console.error('Erreur sub reply:', err)
		}
	}

	const handleDeleteComment = async (commentId) => {
		try {
			const res = await fetch(`/api/user/comment/${commentId}`, { method: 'DELETE', headers })
			if (!res.ok) return
			setComments(prev => prev.filter(c => c.id !== commentId))
		} catch (err) {
			console.error('Erreur delete comment:', err)
		}
	}

	const handleDeleteReply = async (parentId, replyId) => {
		try {
			const res = await fetch(`/api/user/comment/${replyId}`, { method: 'DELETE', headers })
			if (!res.ok) return
			setComments(prev => prev.map(c =>
				c.id === parentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c
			))
		} catch (err) {
			console.error('Erreur delete reply:', err)
		}
	}

	const handleEditSubmit = async () => {
		if (!editRating) return
		try {
			const res = await fetch(`/api/user/review/${review.id}`, {
				method: 'PUT',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ rating: editRating, reviewText: editText })
			})
			if (!res.ok) return
			const data = await res.json()
			setShowEdit(false)
			if (onReviewUpdated) onReviewUpdated(review.id, data.review)
		} catch (err) {
			console.error('Erreur edit review:', err)
		}
	}

	const handleDeleteReview = async () => {
		try {
			const res = await fetch(`/api/user/review/${review.id}`, { method: 'DELETE', headers })
			if (!res.ok) return
			setShowDeleteConfirm(false)
			if (onReviewDeleted) onReviewDeleted(review.id)
		} catch (err) {
			console.error('Erreur delete review:', err)
		}
	}

	const renderStars = (rating) => {
		return [1, 2, 3, 4, 5].map((star) => {
			const full = rating >= star
			const half = !full && rating >= star - 0.5
			return (
				<span key={star} className={`review-star ${full ? 'active' : ''}`} style={{
					background: half ? 'linear-gradient(90deg, #f5a623 50%, #555 50%)' : 'none',
					WebkitBackgroundClip: half ? 'text' : 'none',
					WebkitTextFillColor: half ? 'transparent' : (full ? '#f5a623' : '#555'),
					color: full ? '#f5a623' : '#555'
				}}>★</span>
			)
		})
	}

	const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)

	return (
		<>
			<div className="review-card">
				<div className="review-card-left" onClick={() => navigate(`/game/${review.gameId}`)} style={{ cursor: 'pointer' }}>
					<img src={review.gameImage} alt={review.gameTitle} className="review-game-img" />
					<p className="review-game-title">{review.gameTitle}</p>
				</div>

				<div className="review-card-right">
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<p className="review-author" onClick={() => review.authorId && navigate(`/profile/${review.authorId}`)} style={{ cursor: review.authorId ? 'pointer' : 'default' }}>
							{review.author} {t('reviews.commented')}
						</p>
						{isOwn && (
							<div style={{ display: 'flex', gap: '8px' }}>
								<button onClick={() => { setEditText(review.text || ''); setEditStarsKey(k => k + 1); setShowEdit(true) }}
									style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer' }}>
									<FiEdit2 size={16} />
								</button>
								<button onClick={() => setShowDeleteConfirm(true)}
									style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>
									<FiTrash2 size={16} />
								</button>
							</div>
						)}
					</div>

					<p className="review-text">{review.text}</p>

					<div className="review-footer">
						<div className="review-stars">{renderStars(review.rating)}</div>
						<div className="review-actions">
							<button className={`review-like-btn ${userType === 'like' ? 'liked' : ''}`} onClick={() => handleLikeDislike('like')}>
								<FiThumbsUp />
								{likes > 0 && <span style={{ fontSize: '12px', marginLeft: '4px' }}>{likes}</span>}
							</button>
							<button className={`review-dislike-btn ${userType === 'dislike' ? 'disliked' : ''}`} onClick={() => handleLikeDislike('dislike')}>
								<FiThumbsDown />
								{dislikes > 0 && <span style={{ fontSize: '12px', marginLeft: '4px' }}>{dislikes}</span>}
							</button>
							<button className={`review-reply-btn ${showReply ? 'active' : ''}`} onClick={() => setShowReply(!showReply)}>
								<FiCornerDownRight />
								{totalComments > 0 && <span style={{ fontSize: '12px', marginLeft: '4px' }}>{totalComments}</span>}
							</button>
						</div>
						<p className="review-date">{t('reviews.posted_on')} {review.date}</p>
					</div>

					{showReply && (
						<>
							<div className="review-reply-box">
								<textarea className="reply-textarea" placeholder={t('reviews.write_reply')} value={reply}
									onChange={(e) => setReply(e.target.value)} maxLength={MAX_REPLY} />
								<div className="reply-bottom">
									<span className="reply-count">{reply.length}/{MAX_REPLY}</span>
									<button className="reply-submit-btn" onClick={handleReplySubmit}>→</button>
								</div>
							</div>

							<div className="replies-list">
								{comments.length === 0 ? (
									<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '12px' }}>
										{t('reviews.no_replies')}
									</p>
								) : (
									comments.map((comment) => (
										<div key={comment.id} className="reply-item">
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
												<div style={{ flex: 1 }}>
													<p style={{ color: '#f5a623', fontFamily: '"policeConthrax", sans-serif', fontSize: '11px', marginBottom: '4px', cursor: 'pointer' }}
														onClick={() => navigate(`/profile/${comment.user.id}`)}>
														{comment.user.username}
													</p>
													<p className="reply-text">↩ {comment.text}</p>
												</div>
												<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
													<button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
														style={{ background: 'none', border: 'none', color: replyingTo === comment.id ? '#4caf50' : 'rgba(231,231,231,0.5)', cursor: 'pointer' }}>
														<FiCornerDownRight size={14} />
													</button>
													{comment.user.id === currentUser.id && (
														<button onClick={() => handleDeleteComment(comment.id)}
															style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: '0' }}>
															<FiTrash2 size={14} />
														</button>
													)}
												</div>
											</div>

											{comment.replies?.length > 0 && (
												<div style={{ paddingLeft: '20px', borderLeft: '2px solid rgba(231,231,231,0.2)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
													{comment.replies.map((rep) => (
														<div key={rep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
															<div>
																<p style={{ color: '#f5a623', fontFamily: '"policeConthrax", sans-serif', fontSize: '11px', marginBottom: '4px', cursor: 'pointer' }}
																	onClick={() => navigate(`/profile/${rep.user.id}`)}>
																	{rep.user.username}
																</p>
																<p className="reply-text">↩ {rep.text}</p>
															</div>
															{rep.user.id === currentUser.id && (
																<button onClick={() => handleDeleteReply(comment.id, rep.id)}
																	style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', padding: '0', flexShrink: 0 }}>
																	<FiTrash2 size={14} />
																</button>
															)}
														</div>
													))}
												</div>
											)}

											{replyingTo === comment.id && (
												<div style={{ paddingLeft: '20px', marginTop: '8px' }}>
													<div className="review-reply-box">
														<textarea className="reply-textarea"
															placeholder={`${t('reviews.reply_to')} ${comment.user.username}...`}
															value={subReply} onChange={(e) => setSubReply(e.target.value)} maxLength={MAX_REPLY} />
														<div className="reply-bottom">
															<span className="reply-count">{subReply.length}/{MAX_REPLY}</span>
															<button className="reply-submit-btn" onClick={() => handleSubReplySubmit(comment.id)}>→</button>
														</div>
													</div>
												</div>
											)}
										</div>
									))
								)}
							</div>
						</>
					)}
				</div>
			</div>

			{showEdit && (
				<div className="settings-modal-overlay" onClick={() => setShowEdit(false)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90vw' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
							<h3 className="settings-modal-title">{t('reviews.edit_review')}</h3>
							<button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', color: '#e7e7e7', cursor: 'pointer' }}>
								<FiX size={20} />
							</button>
						</div>
						<p style={{ color: '#f5a623', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', marginBottom: '15px' }}>
							{review.gameTitle}
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
							<button className="settings-cancel-btn" onClick={() => setShowEdit(false)}>{t('reviews.cancel')}</button>
							<button className="settings-save-btn" onClick={handleEditSubmit}>{t('reviews.save')}</button>
						</div>
					</div>
				</div>
			)}

			{showDeleteConfirm && (
				<div className="settings-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
					<div className="settings-modal" onClick={(e) => e.stopPropagation()}>
						<h3 className="settings-modal-title">{t('reviews.delete_review')}</h3>
						<p className="settings-modal-text">{t('reviews.irreversible')}</p>
						<div className="settings-modal-btns">
							<button className="settings-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>{t('reviews.cancel')}</button>
							<button className="settings-confirm-danger-btn" onClick={handleDeleteReview}>{t('reviews.delete')}</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default ReviewsCard