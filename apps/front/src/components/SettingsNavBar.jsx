import '../styles/SettingsNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiHome } from 'react-icons/fi'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const SettingsNavBar = () => {
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
		<nav className="settings-navbar">
			<div className="settings-navbar-left">
				<button className="settings-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>
			<div className="settings-navbar-center">
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/settings" className="settings-navbar-title">{t('nav.settings')}</Link>
			</div>
			<div className="settings-navbar-right">
				<SearchBar />
			</div>
			{menuOpen && (
				<div className="settings-dropdown">
					<NavAvatar size={35} showLabel={true} />
					<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.home')}</a>
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.games')}</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.reviews')}</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.friends')}</a>
					<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.post')}</a>
				</div>
			)}
		</nav>
	)
}

export default SettingsNavBar