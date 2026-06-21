import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import GamesNavBar from '../components/GamesNavBar'
import GamesCarousel from '../components/GamesCarousel'
import Background from '../components/Background'
import '../styles/GamesPage.css'

const GamesPage = () => {
	const [searchParams] = useSearchParams()
	const [categories, setCategories] = useState([
		{ id: "new-releases", title: "New releases", games: [] },
		{ id: "highly-praised", title: "Highly praised", games: [] },
		{ id: "popular", title: "Popular this week", games: [] },
		{ id: "coming-soon", title: "Coming soon", games: [] },
	])

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [newReleases, highlyPraised, popular, comingSoon] = await Promise.all([
					fetch('/api/games/new-releases').then(r => r.json()),
					fetch('/api/games/highly-praised').then(r => r.json()),
					fetch('/api/games/popular').then(r => r.json()),
					fetch('/api/games/coming-soon').then(r => r.json()),
				])

				const formatGames = (games) => games.map(g => ({
					id: g.id,
					title: g.name,
					image: g.cover?.url
						? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}`
						: "https://placehold.co/180x240"
				}))

				setCategories([
					{ id: "new-releases", title: "New releases", games: formatGames(newReleases) },
					{ id: "highly-praised", title: "Highly praised", games: formatGames(highlyPraised) },
					{ id: "popular", title: "Popular this week", games: formatGames(popular) },
					{ id: "coming-soon", title: "Coming soon", games: formatGames(comingSoon) },
				])
			} catch (err) {
				console.error('Erreur fetch IGDB:', err)
			}
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