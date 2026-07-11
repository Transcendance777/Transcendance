import '../styles/HomeNavBar.css'
import '../index.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const HomeNavBar = () => {
	const { t } = useTranslation()
	const [menuOpen, setMenuOpen] = useState(false)
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
		<nav className="navbar">
			<div className="navbar-left">
				<button className="hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
				<a onClick={() => navigate('/games')} className="nav-link nav-link-desktop" style={{ cursor: 'pointer' }}>{t('nav.games')}</a>
				<a onClick={() => navigate('/reviews')} className="nav-link nav-link-desktop" style={{ cursor: 'pointer' }}>{t('nav.reviews')}</a>
				<a onClick={() => navigate('/friends')} className="nav-link nav-link-desktop" style={{ cursor: 'pointer' }}>{t('nav.friends')}</a>
				<a onClick={() => navigate('/post')} className="nav-link plus nav-link-desktop" style={{ cursor: 'pointer' }}>+</a>
			</div>
			<div className="navbar-center">
				<Link to="/home" className="GameRev">GAME REV</Link>
			</div>
			<div className="navbar-right">
				<SearchBar />
				<NavAvatar size={35} />
			</div>
			{menuOpen && (
				<div className="dropdown-menu">
					{window.innerWidth <= 900 && <NavAvatar size={35} showLabel={true} />}
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.games')}</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.reviews')}</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.friends')}</a>
					<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.post')}</a>
				</div>
			)}
		</nav>
	)
}

export default HomeNavBar