import '../styles/FriendsActivity.css'
import { useNavigate } from 'react-router-dom'

const fakeActivities = [
	{ username: "Ami 1", avatar: "https://placehold.co/40x40", type: "liked", action: "liked BrimBrim Patapim's review on", target: "Minecraft", targetType: "game" },
	{ username: "Ami 2", avatar: "https://placehold.co/40x40", type: "posted", action: "posted a review about", target: "Marvel Rivals", targetType: "game" },
	{ username: "Ami 3", avatar: "https://placehold.co/40x40", type: "followed", action: "started following", target: "Ami 4", targetType: "user" },
	{ username: "Ami 4", avatar: "https://placehold.co/40x40", type: "liked", action: "liked a review on", target: "Elden Ring", targetType: "game" },
	{ username: "Ami 5", avatar: "https://placehold.co/40x40", type: "posted", action: "posted a review about", target: "Call of Duty", targetType: "game" },
]

const FriendsActivity = () => {
	const navigate = useNavigate()

	const handleTargetClick = (activity) => {
		if (activity.targetType === 'game') {
			navigate(`/game/${activity.target}`)
		} else if (activity.targetType === 'user') {
			navigate('/profile')
		}
	}

	return (
		<div className="friends-activity-section">
			<h2 className="friends-activity-title">Recent Activity</h2>
			{fakeActivities.map((activity, i) => (
				<div key={i} className="friends-activity-item">
					<img
						src={activity.avatar}
						alt={activity.username}
						className="friends-activity-avatar"
						onClick={() => navigate('/profile')}
					/>
					<p className="friends-activity-text">
						<span className="friends-activity-username" onClick={() => navigate('/profile')}>
							{activity.username}
						</span>
						{' '}{activity.action}{' '}
						<span className="friends-activity-target" onClick={() => handleTargetClick(activity)}>
							{activity.target}
						</span>
					</p>
				</div>
			))}
		</div>
	)
}

export default FriendsActivity