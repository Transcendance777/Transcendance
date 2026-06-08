import '../styles/PostNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const PostNavBar = () => {
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
		<nav className="post-navbar">
			<div className="post-navbar-left">
				<button className="post-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			<div className="post-navbar-center">
				<Link to="/post" className="post-navbar-title">Post</Link>
			</div>
			

			<div className="post-navbar-right">
				<div className="search-container">
					<button className="search-icon" onClick={() => setSearchOpen(!searchOpen)}>
						<FiSearch />
					</button>
					{searchOpen && (
						<input className="search-input" type="text" placeholder="Rechercher un jeu..." autoFocus />
					)}
				</div>
				<a onClick={() => navigate('/profile')} className="nav-link post-profil-link" style={{ cursor: 'pointer' }}>Profile</a>
			</div>

			{menuOpen && (
				<div className="post-dropdown">
					{isMobile && <a onClick={() => navigate('/profile')} className="nav-link" style={{ cursor: 'pointer' }}>Profile</a>}
					<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>Home</a>
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>Games</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>Reviews</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>Friends</a>
				</div>
			)}
		</nav>
	)
}

export default PostNavBar