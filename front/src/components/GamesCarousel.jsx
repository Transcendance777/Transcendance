import { useState, useEffect } from 'react'
import GamesCard from './GamesCard'
import '../styles/GamesCarousel.css'

const GamesCarousel = ({ title, games }) => {
	const [index, setIndex] = useState(0)
	const [visible, setVisible] = useState(6)

	useEffect(() => {
		const updateVisible = () => {
			const width = window.innerWidth
			if (width < 600) setVisible(3)
			else if (width < 900) setVisible(5)
			else if (width < 1200) setVisible(6)
			else if (width < 1500) setVisible(8)
			else setVisible(9)
		}
		updateVisible()
		window.addEventListener('resize', updateVisible)
		return () => window.removeEventListener('resize', updateVisible)
	}, [])

	const prev = () => setIndex(i => (i - 1 + games.length) % games.length)
	const next = () => setIndex(i => (i + 1) % games.length)

	// Construit la liste visible en bouclant si on dépasse la fin
	const getVisibleGames = () => {
		if (games.length === 0) return []
		const result = []
		for (let i = 0; i < visible; i++) {
			result.push(games[(index + i) % games.length])
		}
		return result
	}

	return (
		<div className="games-carousel-section">
			<h2 className="games-carousel-title">{title}</h2>
			<div className="games-carousel-wrapper">
				<button className="games-carousel-btn" onClick={prev}>&#8249;</button>
				<div className="games-carousel-track">
					{getVisibleGames().map((game, i) => (
						<GamesCard key={i} game={game} visibleCount={visible} />
					))}
				</div>
				<button className="games-carousel-btn" onClick={next}>&#8250;</button>
			</div>
		</div>
	)
}

export default GamesCarousel