import '../styles/ReviewsNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiSearch, FiHome } from 'react-icons/fi'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const ReviewsNavBar = () => {
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
		<nav className="reviews-navbar">
			<div className="reviews-navbar-left">
				<button className="reviews-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			<div className="reviews-navbar-center">
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/reviews" className="reviews-navbar-title">Reviews</Link>
			</div>

			<div className="reviews-navbar-right">
				<SearchBar />
				<NavAvatar size={35} />
			</div>

			{menuOpen && (
				<div className="reviews-dropdown">
					{window.innerWidth <= 900 && <NavAvatar size={35} showLabel={true} />}
					<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>Home</a>
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>Games</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>Friends</a>
					<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>Post</a>
					
				</div>
			)}
		</nav>
	)
}

export default ReviewsNavBar