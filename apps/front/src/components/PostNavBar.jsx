import '../styles/PostNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiHome } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const PostNavBar = () => {
	const { t } = useTranslation()
	const [menuOpen, setMenuOpen] = useState(false)
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
				<Link to="/post" className="post-navbar-title">{t('nav.post')}</Link>
			</div>
			<div className="post-navbar-right">
				<SearchBar />
				<NavAvatar size={35} />
			</div>
			{menuOpen && (
				<div className="post-dropdown">
					{window.innerWidth <= 900 && <NavAvatar size={35} showLabel={true} />}
					<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.home')}</a>
					<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.games')}</a>
					<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.reviews')}</a>
					<a onClick={() => navigate('/friends')} className="nav-link" style={{ cursor: 'pointer' }}>{t('nav.friends')}</a>
				</div>
			)}
		</nav>
	)
}

export default PostNavBar