import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts'

const GENRE_COLORS = [
	'#f5a623',
	'#4ecdc4',
	'#ff6b6b',
	'#a78bfa',
	'#60a5fa',
	'#34d399',
	'#f472b6',
	'#fbbf24',
	'#94a3b8',
	'#fb923c',
]

const GameGenreDistributionChart = () => {
	const { t } = useTranslation()
	const [distribution, setDistribution] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return

		const fetchStats = async () => {
			try {
				setLoading(true)
				setError(null)

				const res = await fetch('/api/stats/game-genre-distribution', {
					headers: { Authorization: `Bearer ${token}` },
				})

				if (!res.ok) throw new Error('fetch_failed')

				const json = await res.json()
				setDistribution(json.data ?? [])
			} catch {
				setError(t('stats.load_error'))
			} finally {
				setLoading(false)
			}
		}

		fetchStats()
	}, [t])

	const chartData = useMemo(
		() =>
			distribution.map(({ genre, count }) => ({
				genre,
				label: genre === 'Unknown' ? t('stats.unknown_genre') : genre,
				count,
			})),
		[distribution, t],
	)

	if (loading) {
		return <p className="stats-chart-message">{t('stats.loading')}</p>
	}

	if (error) {
		return <p className="stats-chart-message stats-chart-error">{error}</p>
	}

	if (chartData.length === 0) {
		return <p className="stats-chart-message">{t('stats.no_genre_data')}</p>
	}

	return (
		<div className="stats-chart-card">
			<h3 className="stats-chart-title">{t('stats.genre_distribution_title')}</h3>
			<div className="stats-chart-container stats-pie-chart-container">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={chartData}
							dataKey="count"
							nameKey="label"
							cx="50%"
							cy="50%"
							outerRadius={120}
							label={({ label, percent }) =>
								`${label} (${(percent * 100).toFixed(0)}%)`
							}
							labelLine={{ stroke: '#e7e7e7' }}
						>
							{chartData.map((entry, index) => (
								<Cell
									key={entry.genre}
									fill={GENRE_COLORS[index % GENRE_COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(0, 0, 0, 0.9)',
								border: '1px solid #f5a623',
								borderRadius: '8px',
								color: '#e7e7e7',
								fontFamily: '"policeConthrax", sans-serif',
							}}
							labelStyle={{ color: '#e7e7e7' }}
							formatter={(value) => [value, t('stats.games')]}
						/>
						<Legend
							verticalAlign="bottom"
							wrapperStyle={{
								color: '#e7e7e7',
								fontFamily: '"policeConthrax", sans-serif',
								fontSize: '12px',
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}

export default GameGenreDistributionChart
