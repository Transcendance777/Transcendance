import '../styles/SettingsNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiSearch, FiHome } from 'react-icons/fi'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from './SearchBar'

const SettingsNavBar = () => {
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
		<nav className="settings-navbar">
			<div className="settings-navbar-left">
				<button className="settings-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			<div className="settings-navbar-center">
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/settings" className="settings-navbar-title">Settings</Link>
			</div>

			<div className="settings-navbar-right">
				<SearchBar />
			</div>

			{menuOpen && (
				<div className="settings-dropdown">

					<a onClick={() => navigate('/profile')} className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
						<img src="https://placehold.co/35x35" alt="profile" className="navbar-avatar" />
						<span>Profile</span>
					</a>
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

export default SettingsNavBar