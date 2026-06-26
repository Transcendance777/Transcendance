import '../styles/FriendsNavBar.css'
import '../index.css'
import { useState, useEffect } from 'react'
import { FiHome, FiUserPlus, FiX, FiCheck } from 'react-icons/fi'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import NavAvatar from './NavAvatar'

const FriendsNavBar = () => {
	const [menuOpen, setMenuOpen] = useState(false)
	const [showAddModal, setShowAddModal] = useState(false)
	const [search, setSearch] = useState('')
	const [results, setResults] = useState([])
	const [sentRequests, setSentRequests] = useState([])
	const [searchMsg, setSearchMsg] = useState('')
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

	// Charge les followings existants au montage pour pré-remplir sentRequests
	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return
		fetch('/api/user/following', { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.ok ? res.json() : [])
			.then(data => setSentRequests(data.map(u => u.id)))
			.catch(err => console.error('Erreur following:', err))
	}, [])

	const handleSearch = async (value) => {
		setSearch(value)
		setSearchMsg('')
		if (value.trim() === '') return setResults([])

		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/search?q=${encodeURIComponent(value)}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await res.json()
			if (!res.ok) return setResults([])
			setResults(data)
			if (data.length === 0) setSearchMsg('Aucun utilisateur trouvé.')
		} catch (err) {
			console.error('Erreur search:', err)
		}
	}

	const handleAddFriend = async (userId) => {
		const token = localStorage.getItem('token')
		try {
			const res = await fetch(`/api/user/friend-request/${userId}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			})
			const data = await res.json()
			if (!res.ok) return console.error(data.error)
			setSentRequests(prev => [...prev, userId])
		} catch (err) {
			console.error('Erreur add friend:', err)
		}
	}

	const handleClose = () => {
		setShowAddModal(false)
		setSearch('')
		setResults([])
		setSearchMsg('')
	}

	return (
		<>
			<nav className="friends-navbar">
				<div className="friends-navbar-left">
					<button className="friends-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>☰</button>
				</div>

				<div className="friends-navbar-center">
					<a onClick={() => navigate('/home')} className="nav-link home-icon-link" style={{ cursor: 'pointer' }}>
						<FiHome />
					</a>
					<Link to="/friends" className="friends-navbar-title">Friends</Link>
				</div>

				<div className="friends-navbar-right">
					<SearchBar />
					<button className="friends-add-btn" onClick={() => setShowAddModal(true)}>
						<FiUserPlus size={24} />
					</button>
					<NavAvatar size={35} />
				</div>

				{menuOpen && (
					<div className="friends-dropdown">
						{window.innerWidth <= 900 && <NavAvatar size={35} showLabel={true} />}
						<a onClick={() => navigate('/home')} className="nav-link" style={{ cursor: 'pointer' }}>Home</a>
						<a onClick={() => navigate('/games')} className="nav-link" style={{ cursor: 'pointer' }}>Games</a>
						<a onClick={() => navigate('/reviews')} className="nav-link" style={{ cursor: 'pointer' }}>Reviews</a>
						<a onClick={() => navigate('/post')} className="nav-link" style={{ cursor: 'pointer' }}>Post</a>
					</div>
				)}
			</nav>

			{/* Modale Add Friend */}
			{showAddModal && (
				<div className="add-friend-overlay" onClick={handleClose}>
					<div className="add-friend-modal" onClick={(e) => e.stopPropagation()}>

						<div className="add-friend-modal-header">
							<h3 className="add-friend-modal-title">Add a friend</h3>
							<button className="add-friend-close-btn" onClick={handleClose}>
								<FiX size={20} />
							</button>
						</div>

						<input
							className="add-friend-input"
							type="text"
							placeholder="Search by username..."
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
							autoFocus
						/>

						<div className="add-friend-results">
							{searchMsg && <p className="add-friend-msg">{searchMsg}</p>}
							{results.map((user) => {
								const isFollowing = sentRequests.includes(user.id)
								return (
									<div key={user.id} className="add-friend-result-item">
										<img
											src={user.avatarUrl && user.avatarUrl !== 'default_avatar.png'
												? user.avatarUrl
												: "https://placehold.co/40x40"}
											alt={user.username}
											className="add-friend-result-avatar"
										/>
										<span className="add-friend-result-username">{user.username}</span>
										<button
											className={`add-friend-result-btn ${isFollowing ? 'sent' : ''}`}
											onClick={() => !isFollowing && handleAddFriend(user.id)}
											disabled={isFollowing}
											title={isFollowing ? 'Déjà suivi' : 'Suivre'}
										>
											{isFollowing ? <FiCheck size={16} /> : <FiUserPlus size={16} />}
										</button>
									</div>
								)
							})}
						</div>

					</div>
				</div>
			)}
		</>
	)
}

export default FriendsNavBar