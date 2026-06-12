import '../styles/HomeNavBar.css'
import '../index.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'


const HomeNavBar = () => {
	const [menuOpen, setMenuOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const handleClick = () => setMenuOpen(false)
		if (menuOpen) {
			document.addEventListener('click', handleClick)
		}
		return () => document.removeEventListener('click', handleClick)
	}, [menuOpen])

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 900) {
				setMenuOpen(false)
			}
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<nav className="navbar">
			<div className="navbar-left">
				<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>Games</a>
				<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>Reviews</a>
				<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>Friends</a>
				<a onClick={() => navigate('/post')} className="nav-link plus" style={{ cursor: 'pointer' }}>+</a>
			</div>

			<div className="navbar-center">
				<Link to="/home" className="GameRev">GAME REV</Link>
			</div>

			<div className="navbar-right">
				<div className="search-container">
					<button className="search-icon" onClick={() => setSearchOpen(!searchOpen)}>
						<FiSearch />
					</button>
					{searchOpen && (
						<input
							className="search-input"
							type="text"
							placeholder="Rechercher un jeu..."
							autoFocus
						/>
					)}
				</div>
				<a onClick={() => navigate('/profile')} className="nav-link profil-avatar-link" style={{ cursor: 'pointer' }}>
					<img src="https://placehold.co/35x35" alt="profile" className="navbar-avatar" />
				</a>
				<button className="hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			{menuOpen && (
				<div className="dropdown-menu">
					{window.innerWidth <= 900 && (
						<a onClick={() => navigate('/profile')} className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
							<img src="https://placehold.co/35x35" alt="profile" className="navbar-avatar" />
							<span>Profile</span>
						</a>
					)}
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>Games</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>Reviews</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>Friends</a>
					<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>Post</a>
					
				</div>
			)}
		</nav>
	)
}

export default HomeNavBar