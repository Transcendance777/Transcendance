import '../styles/GamesNavBar.css'
import '../index.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiSearch, FiHome } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const GamesNavBar = ({ pageName }) => {
	const [menuOpen, setMenuOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const navigate = useNavigate()
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 900)

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

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 900)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<nav className="games-navbar">
			<div className="games-navbar-left">
				<button className="games-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			<div className="games-navbar-center">
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/games" className="games-navbar-title">Games</Link>
			</div>

			<div className="games-navbar-right">
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
				<div className="games-dropdown">
					{window.innerWidth <= 900 && (
						<a onClick={() => navigate('/profile')} className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
							<img src="https://placehold.co/35x35" alt="profile" className="navbar-avatar" />
							<span>Profile</span>
						</a>
					)}
					<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>Home</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>Reviews</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>Friends</a>
					<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>Post</a>
				</div>
			)}
		</nav>
	)
}


export default GamesNavBar