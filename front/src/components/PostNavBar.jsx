import '../styles/PostNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiSearch, FiHome } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'

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
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/post" className="post-navbar-title">Post</Link>
			</div>
			

			<div className="post-navbar-right">
				<SearchBar />
				<a onClick={() => navigate('/profile')} className="nav-link profil-avatar-link" style={{ cursor: 'pointer' }}>
					<img src="https://placehold.co/35x35" alt="profile" className="navbar-avatar" />
				</a>
			</div>

			{menuOpen && (
				<div className="post-dropdown">
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
				</div>
			)}
		</nav>
	)
}

export default PostNavBar