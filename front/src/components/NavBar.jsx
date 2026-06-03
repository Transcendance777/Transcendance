import '../styles/NavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'

const NavBar = () => {
	const [menuOpen, setMenuOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)

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
				<a href="" className="nav-link">Games</a>
				<a href="" className="nav-link">Reviews</a>
				<a href="" className="nav-link">Friends</a>
				<a href="" className="plus">+</a>
			</div>

			<div className="navbar-center">
				<h1 className="GameRev">GAME REV</h1>
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
				<a href="" className="nav-link">Profil</a>
				<button className="hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>

			{menuOpen && (
				<div className="dropdown-menu">
					<a href="" className="nav-link">Games</a>
					<a href="" className="nav-link">Reviews</a>
					<a href="" className="nav-link">Friends</a>
					<a href="" className="plus">+</a>
				</div>
			)}
		</nav>
	)
}

export default NavBar