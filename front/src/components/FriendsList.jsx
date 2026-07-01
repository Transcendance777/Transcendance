import '../styles/FriendsList.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'

const fakeFriends = Array.from({ length: 18 }, (_, i) => ({
	username: `Ami ${i + 1}`,
	avatar: "https://placehold.co/70x70"
}))

const ROWS_VISIBLE = 2

const FriendsList = () => {
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

	const totalRows = Math.ceil(fakeFriends.length / friendsPerRow)

	const prev = () => setStartRow(r => Math.max(r - 1, 0))
	const next = () => setStartRow(r => Math.min(r + 1, totalRows - ROWS_VISIBLE))

	const visibleFriends = fakeFriends.slice(
		startRow * friendsPerRow,
		(startRow + ROWS_VISIBLE) * friendsPerRow
	)

	return (
		<div className="friends-list-section">
			<div className="friends-list-wrapper">
				<div className="friends-grid">
					{visibleFriends.map((friend, i) => (
						<div key={i} className="friend-card" onClick={() => navigate('/profile')}>
							<img src={friend.avatar} alt={friend.username} className="friend-avatar" />
							<p className="friend-name">{friend.username}</p>
						</div>
					))}
				</div>
				<div className="friends-scroll-btns">
					<button className="friends-scroll-btn" onClick={prev}><FiChevronUp /></button>
					<button className="friends-scroll-btn" onClick={next}><FiChevronDown /></button>
				</div>
			</div>
		</div>
	)
}

export default FriendsList