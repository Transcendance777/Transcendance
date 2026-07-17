import '../styles/FriendsNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiHome } from 'react-icons/fi'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const FriendsNavBar = ({ onFriendAdded, removedFriendId }) => {
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
		<nav className="friends-navbar">
			<div className="friends-navbar-left">
				<button className="friends-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
			</div>
			<div className="friends-navbar-center">
				<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
					<FiHome />
				</a>
				<Link to="/friends" className="friends-navbar-title">{t('nav.friends')}</Link>
			</div>
			<div className="friends-navbar-right">
				<SearchBar />
				<NavAvatar size={35} />
			</div>
			{menuOpen && (
				<div className="friends-dropdown">
					{window.innerWidth <= 900 && <NavAvatar size={35} showLabel={true} />}
					<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.home')}</a>
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.games')}</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.reviews')}</a>
					<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.post')}</a>
				</div>
			)}
		</nav>
	)
}

export default FriendsNavBar