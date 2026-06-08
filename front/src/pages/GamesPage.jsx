import GamesNavBar from '../components/GamesNavBar'
import GamesCarousel from '../components/GamesCarousel'
import Background from '../components/Background'
import '../styles/GamesPage.css'

const fakeGames = Array.from({ length: 100 }, (_, i) => ({
  title: `Jeu ${i + 1}`,
  image: "https://placehold.co/180x240"
}))

const categories = [
	{ title: "Multiplayer games", games: fakeGames },
	{ title: "Horror games", games: fakeGames },
	{ title: "Action games", games: fakeGames },
]

const Games = () => {
	return (
		<div className="games-page">
			<GamesNavBar pageName="Games" />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="games-content">
					{categories.map((cat, i) => (
						<GamesCarousel key={i} title={cat.title} games={cat.games} />
					))}
				</div>
			</Background>
		</div>
	)
}

export default Games