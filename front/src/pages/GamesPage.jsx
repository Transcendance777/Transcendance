import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import GamesNavBar from '../components/GamesNavBar'
import GamesCarousel from '../components/GamesCarousel'
import Background from '../components/Background'
import '../styles/GamesPage.css'

const fakeGames = Array.from({ length: 100 }, (_, i) => ({
	title: `Jeu ${i + 1}`,
	image: "https://placehold.co/180x240"
}))

const categories = [
	{ id: "new-releases", title: "New releases", games: fakeGames },
	{ id: "highly-praised", title: "Highly praised", games: fakeGames },
	{ id: "multiplayer-games", title: "Multiplayer games", games: fakeGames },
	{ id: "horror-games", title: "Horror games", games: fakeGames },
	{ id: "action-games", title: "Action games", games: fakeGames },
]

const GamesPage = () => {
	const [searchParams] = useSearchParams()

	useEffect(() => {
		const category = searchParams.get('category')
		if (category) {
			const el = document.getElementById(category)
			if (el) el.scrollIntoView({ behavior: 'smooth' })
		}
	}, [searchParams])

	return (
		<div className="games-page">
			<GamesNavBar pageName="Games" />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="games-content">
					{categories.map((cat, i) => (
						<div key={i} id={cat.id}>
							<GamesCarousel title={cat.title} games={cat.games} />
						</div>
					))}
				</div>
			</Background>
		</div>
	)
}

export default GamesPage