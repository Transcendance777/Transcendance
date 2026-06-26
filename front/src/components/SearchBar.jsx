import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import '../styles/SearchBar.css'

const SearchBar = () => {
	const [searchOpen, setSearchOpen] = useState(false)
	const [search, setSearch] = useState('')
	const [results, setResults] = useState([])
	const navigate = useNavigate()

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
		<div className="search-container">
			<button className="search-icon" onClick={() => setSearchOpen(!searchOpen)}>
				<FiSearch />
			</button>
			{searchOpen && (
				<input
					className="search-input"
					type="text"
					placeholder="Rechercher un jeu..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					autoFocus
				/>
			)}
			{searchOpen && results.length > 0 && (
				<div className="search-results">
					{results.map((game, i) => (
						<div key={i} className="search-result-item" onClick={() => handleSelectGame(game.id)}>
							<img src={game.image} alt={game.title} className="search-result-img" />
							<span className="search-result-title">{game.title}</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default SearchBar