import '../styles/FriendsActivity.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const FriendsActivity = () => {
	const navigate = useNavigate()
	const [activities, setActivities] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return

		fetch('/api/user/friends-activity', {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(res => res.ok ? res.json() : [])
			.then(data => {
				setActivities(data)
				setLoading(false)
			})
			.catch(err => {
				console.error('Erreur activity:', err)
				setLoading(false)
			})
	}, [])

	if (loading) return null

	return (
		<div className="friends-activity-section">
			<h2 className="friends-activity-title">Recent Activity</h2>
			{activities.length === 0 ? (
				<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', padding: '10px 0' }}>
					No recent activity from people you follow.
				</p>
			) : (
				activities.map((activity, i) => (
					<div key={i} className="friends-activity-item">
						<img
							src={activity.avatarUrl && activity.avatarUrl !== 'default_avatar.png'
								? activity.avatarUrl
								: "https://placehold.co/40x40"}
							alt={activity.username}
							className="friends-activity-avatar"
							onClick={() => navigate(`/profile/${activity.userId}`)}
							style={{ cursor: 'pointer' }}
						/>
						<p className="friends-activity-text">
							<span
								className="friends-activity-username"
								onClick={() => navigate(`/profile/${activity.userId}`)}
								style={{ cursor: 'pointer' }}
							>
								{activity.username}
							</span>
							{' '}liked{' '}
							<span
								className="friends-activity-target"
								onClick={() => navigate(`/game/${activity.targetId}`)}
								style={{ cursor: 'pointer' }}
							>
								{activity.target}
							</span>
						</p>
					</div>
				))
			)}
		</div>
	)
}

export default FriendsActivity