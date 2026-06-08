import { useState } from 'react'
import '../styles/PostGamePicker.css'

const fakeGames = Array.from({ length: 20 }, (_, i) => ({
	title: `Jeu ${i + 1}`,
	image: "https://placehold.co/100x140"
}))

const PostGamePicker = ({ onSelect, onClose }) => {
	const [search, setSearch] = useState('')

	const filtered = fakeGames.filter(g =>
		g.title.toLowerCase().includes(search.toLowerCase())
	)

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
				<div className="picker-grid">
					{filtered.map((game, i) => (
						<div key={i} className="picker-game" onClick={() => { onSelect(game); onClose() }}>
							<img src={game.image} alt={game.title} className="picker-game-img" />
							<p className="picker-game-title">{game.title}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default PostGamePicker