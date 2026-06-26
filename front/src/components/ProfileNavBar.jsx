import '../styles/ProfileNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiSearch, FiSettings, FiHome } from 'react-icons/fi'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const ProfileNavBar = () => {
	const [menuOpen, setMenuOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const handleClick = () => setMenuOpen(false)
		if (menuOpen) document.addEventListener('click', handleClick)
		return () => document.removeEventListener('click', handleClick)
	}, [menuOpen])

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 900) setMenuOpen(false)
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<nav className="profile-navbar">
			<div className="profile-navbar-left">
				<button className="profile-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			<div className="profile-navbar-center">
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/profile" className="profile-navbar-title">Profile</Link>
			</div>

			<div className="profile-navbar-right">
				<SearchBar />
				<button className="profile-settings-btn" onClick={() => navigate('/settings')}>
					<FiSettings />
				</button>
			</div>

			{menuOpen && (
				<div className="profile-dropdown">
					<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>Home</a>
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>Games</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>Reviews</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>Friends</a>
					<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>Post</a>
				</div>
			)}
		</nav>
	)
}

export default ProfileNavBar