import '../styles/GamesNavBar.css'
import '../index.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiSearch, FiHome } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const GamesNavBar = ({ pageName }) => {
	const [menuOpen, setMenuOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [results, setResults] = useState([])
	const navigate = useNavigate()
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 900)
	const user = JSON.parse(localStorage.getItem('user') || '{}')

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

	// Recherche dynamique avec debounce
	useEffect(() => {
		if (search.trim() === '') {
			setResults([])
			return
		}

		const timeout = setTimeout(async () => {
			try {
				const res = await fetch(`/api/games/search?q=${encodeURIComponent(search)}`)
				const data = await res.json()
				const formatted = data.map(g => ({
					id: g.idExterne || g.id,
					title: g.title || g.name,
					image: g.coverImageUrl ||
						(g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : "https://placehold.co/40x55")
				}))
				setResults(formatted.slice(0, 50))
			} catch (err) {
				console.error('Erreur recherche:', err)
			}
		}, 300)

		return () => clearTimeout(timeout)
	}, [search])

	const handleSelectGame = (id) => {
		setSearch('')
		setResults([])
		setSearchOpen(false)
		navigate(`/game/${id}`)
	}

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
				<SearchBar />
				<NavAvatar size={35} />
			</div>

			{menuOpen && (
				<div className="games-dropdown">
					{window.innerWidth <= 900 && <NavAvatar size={35} showLabel={true} />}
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