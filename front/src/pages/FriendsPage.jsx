import { useState, useEffect } from 'react'
import FriendsNavBar from '../components/FriendsNavBar'
import Background from '../components/Background'
import FriendsList from '../components/FriendsList'
import FriendsActivity from '../components/FriendsActivity'
import '../styles/FriendsPage.css'
import Footer from '../components/Footer'

const FriendsPage = () => {
	const [friends, setFriends] = useState([])
	const [activities, setActivities] = useState([])
	const [loadingFriends, setLoadingFriends] = useState(true)
	const [loadingActivity, setLoadingActivity] = useState(true)
	const [lastRemovedId, setLastRemovedId] = useState(null)

	const fetchFriends = () => {
		const token = localStorage.getItem('token')
		if (!token) return
		fetch('/api/user/following', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.ok ? res.json() : [])
			.then(data => { setFriends(data); setLoadingFriends(false) })
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

	return (
		<div className="friends-page">
			<FriendsNavBar onFriendAdded={handleFriendAdded} removedFriendId={lastRemovedId} />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="friends-content">
					<FriendsList
						friends={friends}
						loading={loadingFriends}
						onUnfollow={handleFriendRemoved}
					/>
					<FriendsActivity
						activities={activities}
						loading={loadingActivity}
					/>
				</div>
			</Background>
			<Footer />
		</div>
	)
}

export default FriendsPage