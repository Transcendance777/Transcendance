import { useNavigate } from 'react-router-dom'

const NavAvatar = ({ size = 35, showLabel = false }) => {
	const navigate = useNavigate()

	const user = JSON.parse(localStorage.getItem('user') || '{}')
	const avatarUrl = (user.avatarUrl && user.avatarUrl !== 'default_avatar.png')
		? user.avatarUrl
		: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=f5a623&color=fff&size=128&bold=true`

	return (
		<a onClick={() => navigate('/profile')} className={showLabel ? 'nav-link dropdown-avatar-link' : 'nav-link profil-avatar-link'} style={{ cursor: 'pointer', display: showLabel ? 'flex' : 'inline-flex', alignItems: 'center', gap: showLabel ? '10px' : '0' }}>
			<img src={avatarUrl} alt="profile" className="navbar-avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
			{showLabel && <span>Profile</span>}
		</a>
	)
}

export default NavAvatar