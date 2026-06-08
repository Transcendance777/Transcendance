import '../styles/GamesCard.css'

const GamesCard = ({ game, visibleCount }) => {
	return (
		<div
			className="games-card"
			style={{ width: `calc((100% - ${15 * (visibleCount - 1)}px) / ${visibleCount})` }}
		>
			<img src={game.image} alt={game.title} className="games-card-img" />
			<p className="games-card-title">{game.title}</p>
		</div>
	)
}

export default GamesCard