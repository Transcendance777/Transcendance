import { useState, useEffect } from 'react'
import '../styles/PostGamePicker.css'

const PostGamePicker = ({ onSelect, onClose }) => {
	const [search, setSearch] = useState('')
	const [games, setGames] = useState([])
	const [loading, setLoading] = useState(false)

	const formatGames = (data) => data.map(g => ({
		id: g.idExterne || g.id,
		title: g.title || g.name,
		image: g.coverImageUrl ||
			(g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : "https://placehold.co/100x140")
	}))

	useEffect(() => {
		const timeout = setTimeout(async () => {
			setLoading(true)
			try {
				let res
				if (search.trim() === '') {
					res = await fetch('/api/games/all')
				} else {
					res = await fetch(`/api/games/search?q=${encodeURIComponent(search)}`)
				}
				const data = await res.json()
				setGames(formatGames(data))
			} catch (err) {
				console.error('Erreur:', err)
			} finally {
				setLoading(false)
			}
		}, 300)

		return () => clearTimeout(timeout)
	}, [search])

	return (
		<div className="picker-overlay" onClick={onClose}>
			<div className="picker-modal" onClick={(e) => e.stopPropagation()}>
				<input
					className="picker-search"
					type="text"
					placeholder="Rechercher un jeu..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					autoFocus
				/>
				{loading ? (
					<p style={{ color: '#e7e7e7', fontFamily: 'policeConthrax', textAlign: 'center', padding: '20px' }}>
						Chargement...
					</p>
				) : (
					<div className="picker-grid">
						{games.map((game, i) => (
							<div key={i} className="picker-game" onClick={() => { onSelect(game); onClose() }}>
								<img src={game.image} alt={game.title} className="picker-game-img" />
								<p className="picker-game-title">{game.title}</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default PostGamePicker