import '../styles/FriendsList.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown, FiUserMinus } from 'react-icons/fi'

const ROWS_VISIBLE = 2

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const FriendsList = ({ friends, loading, onUnfollow }) => {
	const navigate = useNavigate()
	const [startRow, setStartRow] = useState(0)
	const [friendsPerRow, setFriendsPerRow] = useState(6)

	useEffect(() => {
		const update = () => {
			if (window.innerWidth < 480) setFriendsPerRow(3)
			else if (window.innerWidth < 768) setFriendsPerRow(4)
			else setFriendsPerRow(6)
		}
		update()
		window.addEventListener('resize', update)
		return () => window.removeEventListener('resize', update)
	}, [])

	const handleUnfollow = async (e, userId) => {
		e.stopPropagation()
		const token = localStorage.getItem('token')
		const res = await fetch(`/api/user/follow/${userId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` }
		})
		if (res.ok) {
			onUnfollow(userId)
			setStartRow(0)
		}
	}

	const totalRows = Math.ceil(friends.length / friendsPerRow)
	const prev = () => setStartRow(r => Math.max(r - 1, 0))
	const next = () => setStartRow(r => Math.min(r + 1, Math.max(0, totalRows - ROWS_VISIBLE)))
	const visibleFriends = friends.slice(startRow * friendsPerRow, (startRow + ROWS_VISIBLE) * friendsPerRow)

	if (loading) return null

	return (
		<div className="friends-list-section">
			{friends.length === 0 ? (
				<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', padding: '20px' }}>
					You follow nobody for now.
				</p>
			) : (
				<div className="friends-list-wrapper">
					<div className="friends-grid">
						{visibleFriends.map((friend) => (
							<div key={friend.id} className="friend-card" style={{ position: 'relative' }} onClick={() => navigate(`/profile/${friend.id}`)}>
								<button
									onClick={(e) => handleUnfollow(e, friend.id)}
									title="Unfollow"
									style={{
										position: 'absolute', top: '4px', right: '4px',
										background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f44336',
										borderRadius: '50%', width: '24px', height: '24px',
										display: 'flex', alignItems: 'center', justifyContent: 'center',
										cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s ease', zIndex: 2
									}}
									className="unfollow-btn"
								>
									<FiUserMinus size={13} />
								</button>
								<img
									src={getAvatar(friend.avatarUrl, friend.username)}
									alt={friend.username}
									className="friend-avatar"
								/>
								<p className="friend-name">{friend.username}</p>
							</div>
						))}
					</div>
					{totalRows > ROWS_VISIBLE && (
						<div className="friends-scroll-btns">
							<button className="friends-scroll-btn" onClick={prev}><FiChevronUp /></button>
							<button className="friends-scroll-btn" onClick={next}><FiChevronDown /></button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default FriendsList