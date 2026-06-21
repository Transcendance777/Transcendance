import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import GamesNavBar from '../components/GamesNavBar'
import GamesCarousel from '../components/GamesCarousel'
import Background from '../components/Background'
import '../styles/GamesPage.css'

// Toutes les catégories disponibles
const ALL_CATEGORIES = [
	{ id: "shooter", title: "Shooter", endpoint: "/api/games/category/shooter" },
	{ id: "rpg", title: "RPG", endpoint: "/api/games/category/rpg" },
	{ id: "adventure", title: "Adventure", endpoint: "/api/games/category/adventure" },
	{ id: "fighting", title: "Fighting", endpoint: "/api/games/category/fighting" },
	{ id: "strategy", title: "Strategy", endpoint: "/api/games/category/strategy" },
	{ id: "simulator", title: "Simulator", endpoint: "/api/games/category/simulator" },
	{ id: "racing", title: "Racing", endpoint: "/api/games/category/racing" },
	{ id: "indie", title: "Indie", endpoint: "/api/games/category/indie" },
	{ id: "platform", title: "Platformer", endpoint: "/api/games/category/platform" },
	{ id: "sport", title: "Sports", endpoint: "/api/games/category/sport" },
	{ id: "horror", title: "Horror", endpoint: "/api/games/category/horror" },
	{ id: "survival", title: "Survival", endpoint: "/api/games/category/survival" },
	{ id: "openworld", title: "Open World", endpoint: "/api/games/category/openworld" },
	{ id: "action", title: "Action", endpoint: "/api/games/category/action" },
	{ id: "scifi", title: "Sci-Fi", endpoint: "/api/games/category/scifi" },
	{ id: "fantasy", title: "Fantasy", endpoint: "/api/games/category/fantasy" },
	{ id: "stealth", title: "Stealth", endpoint: "/api/games/category/stealth" },
	{ id: "multiplayer", title: "Multiplayer", endpoint: "/api/games/category/multiplayer" },
	{ id: "solo", title: "Singleplayer", endpoint: "/api/games/category/solo" },
	{ id: "coop", title: "Co-op", endpoint: "/api/games/category/coop" },
]

// Catégories toujours présentes en haut
const BASE_CATEGORIES = [
	{ id: "new-releases", title: "New releases", endpoint: "/api/games/new-releases" },
	{ id: "highly-praised", title: "Highly praised", endpoint: "/api/games/highly-praised" },
	{ id: "recent-acclaimed", title: "Recent hits", endpoint: "/api/games/recent-acclaimed" },
	{ id: "popular", title: "Popular this week", endpoint: "/api/games/popular" },
	{ id: "coming-soon", title: "Coming soon", endpoint: "/api/games/coming-soon" },
]

// Mélange un tableau
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const GamesPage = () => {
	const [searchParams] = useSearchParams()
	const [categories, setCategories] = useState([])

	useEffect(() => {
		const fetchAll = async () => {
			// Choisit 6 catégories aléatoires parmi toutes
			const randomCats = shuffle(ALL_CATEGORIES)
			const selectedCats = [...BASE_CATEGORIES, ...randomCats]

			const formatGames = (games) => games.map(g => ({
				id: g.idExterne || g.id,
				title: g.title || g.name,
				image: g.coverImageUrl ||
					(g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : "https://placehold.co/180x240")
			}))

			const results = await Promise.all(
				selectedCats.map(async (cat) => {
					try {
						const res = await fetch(cat.endpoint)
						const data = await res.json()
						return { ...cat, games: formatGames(Array.isArray(data) ? data : []) }
					} catch {
						return { ...cat, games: [] }
					}
				})
			)

			// Garde seulement les catégories qui ont des jeux
			setCategories(results.filter(c => c.games.length > 0))
		}
		fetchAll()
	}, [])

	useEffect(() => {
		const category = searchParams.get('category')
		if (category) {
			const el = document.getElementById(category)
			if (el) el.scrollIntoView({ behavior: 'smooth' })
		}
	}, [searchParams, categories])

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