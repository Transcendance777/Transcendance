import '../styles/FriendsActivity.css'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const getAvatar = (avatarUrl, username) => {
	if (avatarUrl && avatarUrl !== 'default_avatar.png') return avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

const FriendsActivity = ({ activities, loading }) => {
	const navigate = useNavigate()
	const { t } = useTranslation()

	const handleClick = (activity) => {
		if (activity.type === 'reviewed' && activity.reviewId) {
			navigate('/reviews', { state: { tab: 'friends', reviewId: activity.reviewId } })
		} else if (activity.targetType === 'user') {
			navigate(`/profile/${activity.targetId}`)
		} else {
			navigate(`/game/${activity.targetId}`)
		}
	}

	const getEmoji = (type) => {
		if (type === 'liked') return '❤️'
		if (type === 'reviewed') return '⭐'
		if (type === 'playing') return '🎮'
		if (type === 'followed') return '👤'
		return '•'
	}

	const getAction = (type) => {
		if (type === 'liked') return t('activity.liked')
		if (type === 'reviewed') return t('activity.reviewed')
		if (type === 'playing') return t('activity.playing')
		if (type === 'followed') return t('activity.followed')
		return ''
	}

	if (loading) return null

	return (
		<div className="friends-activity-section">
			<h2 className="friends-activity-title">{t('friends.recent_activity')}</h2>
			{activities.length === 0 ? (
				<p style={{ color: 'rgba(231,231,231,0.5)', fontFamily: '"policeConthrax", sans-serif', fontSize: '13px', padding: '10px 0' }}>
					{t('friends.no_activity')}
				</p>
			) : (
				activities.map((activity, i) => (
					<div key={i} className="friends-activity-item" onClick={() => handleClick(activity)} style={{ cursor: 'pointer' }}>
						<img
							src={getAvatar(activity.avatarUrl, activity.username)}
							alt={activity.username}
							className="friends-activity-avatar"
							onClick={(e) => { e.stopPropagation(); navigate(`/profile/${activity.userId}`) }}
						/>
						<p className="friends-activity-text">
							<span className="friends-activity-username"
								onClick={(e) => { e.stopPropagation(); navigate(`/profile/${activity.userId}`) }}
								style={{ cursor: 'pointer' }}>
								{activity.username}
							</span>
							{' '}{getAction(activity.type)}{' '}
							<span className="friends-activity-target">
								{getEmoji(activity.type)} {activity.target}
							</span>
						</p>
					</div>
				))
			)}
		</div>
	)
}

export default FriendsActivity