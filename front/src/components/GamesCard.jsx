import '../styles/GamesCard.css'

const GamesCard = ({ game }) => {
	return (
		<div className="games-card">
			<img src={game.image} alt={game.title} className="games-card-img" />
			<p className="games-card-title">{game.title}</p>
		</div>
	)
}

export default GamesCard