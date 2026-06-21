import '../styles/GamesCard.css'
import { useNavigate } from 'react-router-dom'

const GamesCard = ({ game, visibleCount }) => {
	const navigate = useNavigate()

	return (
		<div
			className="games-card"
			style={{ width: `calc((100% - ${15 * (visibleCount - 1)}px) / ${visibleCount})` }}
			onClick={() => navigate(`/game/${game.id}`)}
		>
			<img src={game.image} alt={game.title} className="games-card-img" />
			<p className="games-card-title">{game.title}</p>
		</div>
	)
}

export default GamesCard