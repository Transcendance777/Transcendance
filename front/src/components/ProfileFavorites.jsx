import { useNavigate } from 'react-router-dom'
import '../styles/ProfileFavorites.css'

const ProfileFavorites = ({ games }) => {
	const navigate = useNavigate()

	return (
		<div className="profile-favorites">
			<h2 className="profile-section-title">Favorite Games</h2>
			<div className="favorites-grid">
				{games.map((game, i) => (
					<div key={i} className="favorite-card" onClick={() => navigate(`/game/${game.title}`)}>
						<img src={game.image} alt={game.title} className="favorite-img" />
						<p className="favorite-title">{game.title}</p>
					</div>
				))}
			</div>
		</div>
	)
}

export default ProfileFavorites