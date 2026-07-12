import { useEffect, useState } from 'react'
import { FiHome } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchBar from '../SearchBar'
import NavAvatar from '../NavAvatar'

const ChatNavBar = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [menuOpen, setMenuOpen] = useState(false)

	useEffect(() => {
		const closeMenu = () => setMenuOpen(false)
		if (menuOpen) document.addEventListener('click', closeMenu)
		return () => document.removeEventListener('click', closeMenu)
	}, [menuOpen])

	return (
		<nav className="chat-navbar">
			<div className="chat-navbar-left">
				<button className="chat-hamburger" onClick={(event) => { event.stopPropagation(); setMenuOpen(value => !value) }} aria-label={t('chat.menu')}>
					☰
				</button>
			</div>
			<div className="chat-navbar-center">
				<button className="chat-home-link home-icon-link" onClick={() => navigate('/home')} aria-label={t('nav.home')}>
					<FiHome />
				</button>
				<Link to="/chat" className="chat-navbar-title">{t('chat.title')}</Link>
			</div>
			<div className="chat-navbar-right">
				<SearchBar />
				<NavAvatar size={35} />
			</div>
			{menuOpen && (
				<div className="chat-dropdown">
					<NavAvatar size={35} showLabel={true} />
					<button onClick={() => navigate('/home')}>{t('nav.home')}</button>
					<button onClick={() => navigate('/games')}>{t('nav.games')}</button>
					<button onClick={() => navigate('/reviews')}>{t('nav.reviews')}</button>
					<button onClick={() => navigate('/friends')}>{t('nav.friends')}</button>
				</div>
			)}
		</nav>
	)
}

export default ChatNavBar
