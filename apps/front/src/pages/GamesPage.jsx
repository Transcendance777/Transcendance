import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GamesNavBar from '../components/GamesNavBar'
import GamesCarousel from '../components/GamesCarousel'
import Background from '../components/Background'
import '../styles/GamesPage.css'
import Footer from '../components/Footer'

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const GamesPage = () => {
	const { t } = useTranslation()
	const [searchParams] = useSearchParams()
	const [categories, setCategories] = useState([])

	const ALL_CATEGORIES = [
		{ id: "shooter", title: t('game.cat_shooter'), endpoint: "/api/games/category/shooter" },
		{ id: "rpg", title: t('game.cat_rpg'), endpoint: "/api/games/category/rpg" },
		{ id: "adventure", title: t('game.cat_adventure'), endpoint: "/api/games/category/adventure" },
		{ id: "fighting", title: t('game.cat_fighting'), endpoint: "/api/games/category/fighting" },
		{ id: "strategy", title: t('game.cat_strategy'), endpoint: "/api/games/category/strategy" },
		{ id: "simulator", title: t('game.cat_simulator'), endpoint: "/api/games/category/simulator" },
		{ id: "racing", title: t('game.cat_racing'), endpoint: "/api/games/category/racing" },
		{ id: "indie", title: t('game.cat_indie'), endpoint: "/api/games/category/indie" },
		{ id: "platform", title: t('game.cat_platform'), endpoint: "/api/games/category/platform" },
		{ id: "sport", title: t('game.cat_sport'), endpoint: "/api/games/category/sport" },
		{ id: "horror", title: t('game.cat_horror'), endpoint: "/api/games/category/horror" },
		{ id: "survival", title: t('game.cat_survival'), endpoint: "/api/games/category/survival" },
		{ id: "openworld", title: t('game.cat_openworld'), endpoint: "/api/games/category/openworld" },
		{ id: "action", title: t('game.cat_action'), endpoint: "/api/games/category/action" },
		{ id: "scifi", title: t('game.cat_scifi'), endpoint: "/api/games/category/scifi" },
		{ id: "fantasy", title: t('game.cat_fantasy'), endpoint: "/api/games/category/fantasy" },
		{ id: "stealth", title: t('game.cat_stealth'), endpoint: "/api/games/category/stealth" },
		{ id: "multiplayer", title: t('game.cat_multiplayer'), endpoint: "/api/games/category/multiplayer" },
		{ id: "solo", title: t('game.cat_solo'), endpoint: "/api/games/category/solo" },
		{ id: "coop", title: t('game.cat_coop'), endpoint: "/api/games/category/coop" },
	]

	const BASE_CATEGORIES = [
		{ id: "new-releases", title: t('home.new_releases').replace(' →', ''), endpoint: "/api/games/new-releases" },
		{ id: "highly-praised", title: t('game.cat_highly_praised'), endpoint: "/api/games/highly-praised" },
		{ id: "recent-acclaimed", title: t('home.recent_hits').replace(' →', ''), endpoint: "/api/games/recent-acclaimed" },
		{ id: "popular", title: t('home.popular'), endpoint: "/api/games/popular" },
		{ id: "coming-soon", title: t('home.coming_soon'), endpoint: "/api/games/coming-soon" },
	]

	useEffect(() => {
		const fetchAll = async () => {
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

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

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
			<Footer />
		</div>
	)
}

export default GamesPage