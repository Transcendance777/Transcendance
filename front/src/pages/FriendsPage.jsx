import { useState, useEffect } from 'react'
import FriendsNavBar from '../components/FriendsNavBar'
import Background from '../components/Background'
import FriendsList from '../components/FriendsList'
import FriendsActivity from '../components/FriendsActivity'
import '../styles/FriendsPage.css'
import Footer from '../components/Footer'
import { FiX, FiUserPlus, FiCheck } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const FriendsPage = () => {
	const { t } = useTranslation()
	const [friends, setFriends] = useState([])
	const [activities, setActivities] = useState([])
	const [loadingFriends, setLoadingFriends] = useState(true)
	const [loadingActivity, setLoadingActivity] = useState(true)
	const [lastRemovedId, setLastRemovedId] = useState(null)
	const [showAddModal, setShowAddModal] = useState(false)
	const [search, setSearch] = useState('')
	const [results, setResults] = useState([])
	const [sentRequests, setSentRequests] = useState([])
	const [searchMsg, setSearchMsg] = useState('')

	const fetchFriends = () => {
		const token = localStorage.getItem('token')
		if (!token) return
		fetch('/api/user/following', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.ok ? res.json() : [])
			.then(data => { setFriends(data); setLoadingFriends(false); setSentRequests(data.map(u => u.id)) })
			.catch(err => { console.error(err); setLoadingFriends(false) })
	}

	const fetchActivity = () => {
		const token = localStorage.getItem('token')
		if (!token) return
		fetch('/api/user/friends-activity', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.ok ? res.json() : [])
			.then(data => { setActivities(data); setLoadingActivity(false) })
			.catch(err => { console.error(err); setLoadingActivity(false) })
	}

	useEffect(() => {
		fetchFriends()
		fetchActivity()
	}, [])

	const handleFriendAdded = () => {
		fetchFriends()
		fetchActivity()
	}

	const handleFriendRemoved = (userId) => {
		setFriends(prev => prev.filter(f => f.id !== userId))
		setActivities(prev => prev.filter(a => a.userId !== userId))
		setLastRemovedId(userId)
	}

	const handleSearch = async (value) => {
		setSearch(value)
		setSearchMsg('')
		if (value.trim() === '') return setResults([])
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/search?q=${encodeURIComponent(value)}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await res.json()
			if (!res.ok) return setResults([])
			setResults(data)
			if (data.length === 0) setSearchMsg(t('friends.no_user'))
		} catch (err) {
			console.error('Erreur search:', err)
		}
	}

	const handleAddFriend = async (userId) => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/friend-request/${userId}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await res.json()
			if (!res.ok) return console.error(data.error)
			setSentRequests(prev => [...prev, userId])
			handleFriendAdded()
		} catch (err) {
			console.error('Erreur add friend:', err)
		}
	}

	const handleClose = () => {
		setShowAddModal(false)
		setSearch('')
		setResults([])
		setSearchMsg('')
	}

	return (
		<div className="friends-page">
			<FriendsNavBar onFriendAdded={handleFriendAdded} removedFriendId={lastRemovedId} />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="friends-content">
					<FriendsList
						friends={friends}
						loading={loadingFriends}
						onUnfollow={handleFriendRemoved}
						onAddFriend={() => setShowAddModal(true)}
					/>
					<FriendsActivity
						activities={activities}
						loading={loadingActivity}
					/>
				</div>
			</Background>
			<Footer />

			{showAddModal && (
				<div className="add-friend-overlay" onClick={handleClose}>
					<div className="add-friend-modal" onClick={(e) => e.stopPropagation()}>
						<div className="add-friend-modal-header">
							<h3 className="add-friend-modal-title">{t('friends.add_friend')}</h3>
							<button className="add-friend-close-btn" onClick={handleClose}><FiX size={20} /></button>
						</div>
						<input
							className="add-friend-input"
							type="text"
							placeholder={t('friends.search_username')}
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
							autoFocus
						/>
						<div className="add-friend-results">
							{searchMsg && <p className="add-friend-msg">{searchMsg}</p>}
							{results.map((user) => {
								const isFollowing = sentRequests.includes(user.id)
								return (
									<div key={user.id} className="add-friend-result-item">
										<img
											src={getAvatar(user.avatarUrl, user.username)}
											alt={user.username}
											className="add-friend-result-avatar"
											style={{ cursor: 'pointer' }}
										/>
										<span className="add-friend-result-username" style={{ cursor: 'pointer', flex: 1 }}>
											{user.username}
										</span>
										<button
											className={`add-friend-result-btn ${isFollowing ? 'sent' : ''}`}
											onClick={() => !isFollowing && handleAddFriend(user.id)}
											disabled={isFollowing}
										>
											{isFollowing ? <FiCheck size={16} /> : <FiUserPlus size={16} />}
										</button>
									</div>
								)
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default FriendsPage