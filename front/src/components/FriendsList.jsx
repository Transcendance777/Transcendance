import '../styles/FriendsList.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'

const ROWS_VISIBLE = 2

const FriendsList = () => {
	const navigate = useNavigate()
	const [friends, setFriends] = useState([])
	const [startRow, setStartRow] = useState(0)
	const [friendsPerRow, setFriendsPerRow] = useState(6)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return

		fetch('/api/user/following', {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(res => res.ok ? res.json() : [])
			.then(data => setFriends(data))
			.catch(err => console.error('Erreur following:', err))
	}, [])

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

	const totalRows = Math.ceil(friends.length / friendsPerRow)

	const prev = () => setStartRow(r => Math.max(r - 1, 0))
	const next = () => setStartRow(r => Math.min(r + 1, Math.max(0, totalRows - ROWS_VISIBLE)))

	const visibleFriends = friends.slice(
		startRow * friendsPerRow,
		(startRow + ROWS_VISIBLE) * friendsPerRow
	)

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
							<div key={friend.id} className="friend-card" onClick={() => navigate(`/profile/${friend.id}`)}>
								<img
									src={friend.avatarUrl && friend.avatarUrl !== 'default_avatar.png'
										? friend.avatarUrl
										: "https://placehold.co/70x70"}
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