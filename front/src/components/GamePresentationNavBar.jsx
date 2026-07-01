import '../styles/GamePresentationNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiSearch, FiHome } from 'react-icons/fi'
import { useNavigate, Link } from 'react-router-dom'

const GamePresentationNavBar = ({ gameName }) => {
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
		<nav className="gamepresentation-navbar">
			<div className="gamepresentation-navbar-left">
				<button className="gamepresentation-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			<div className="gamepresentation-navbar-center">
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/games" className="gamepresentation-navbar-title">Games</Link>
			</div>

			<div className="gamepresentation-navbar-right">
				<div className="search-container">
					<button className="search-icon" onClick={() => setSearchOpen(!searchOpen)}>
						<FiSearch />
					</button>
					{searchOpen && (
						<input className="search-input" type="text" placeholder="Rechercher un jeu..." autoFocus />
					)}
				</div>
				<a onClick={() => navigate('/profile')} className="nav-link profil-avatar-link" style={{ cursor: 'pointer' }}>
					<img src="https://placehold.co/35x35" alt="profile" className="navbar-avatar" />
				</a>
			</div>

			{menuOpen && (
				<div className="gamepresentation-dropdown">
					{window.innerWidth <= 900 && (
						<a onClick={() => navigate('/profile')} className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
							<img src="https://placehold.co/35x35" alt="profile" className="navbar-avatar" />
							<span>Profile</span>
						</a>
					)}
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

export default GamePresentationNavBar