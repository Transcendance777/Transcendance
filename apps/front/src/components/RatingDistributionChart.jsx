import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import {
	buildRatingStatsUrl,
	DEFAULT_STATS_GENRE,
} from './statsUtils'

const RatingDistributionChart = ({ statsFilter }) => {
	const { t } = useTranslation()
	const [distribution, setDistribution] = useState([])
	const [availableGenres, setAvailableGenres] = useState([])
	const [genre, setGenre] = useState(DEFAULT_STATS_GENRE)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) {
			setLoading(false)
			return
		}

		const fetchStats = async () => {
			try {
				setLoading(true)
				setError(null)

				const res = await fetch(
					buildRatingStatsUrl(statsFilter, genre),
					{ headers: { Authorization: `Bearer ${token}` } },
				)

				if (!res.ok) throw new Error('fetch_failed')

				const json = await res.json()
				setDistribution(json.data ?? [])
				setAvailableGenres(json.availableGenres ?? [])
			} catch {
				setError(t('stats.load_error'))
			} finally {
				setLoading(false)
			}
		}

		fetchStats()
	}, [statsFilter, genre, t])

	useEffect(() => {
		setGenre(DEFAULT_STATS_GENRE)
	}, [statsFilter])

	const chartData = useMemo(
		() =>
			distribution.map(({ rating, count }) => ({
				rating,
				label: t('stats.rating_star', { rating }),
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

	return (
		<div className="stats-chart-card">
			<div className="stats-chart-header">
				<h3 className="stats-chart-title">{t('stats.rating_distribution_title')}</h3>
				<div className="stats-chart-filter">
					<label className="stats-period-label" htmlFor="stats-genre-select">
						{t('stats.genre_label')}
					</label>
					<select
						id="stats-genre-select"
						className="stats-period-select"
						value={genre}
						onChange={(e) => setGenre(e.target.value)}
					>
						<option value={DEFAULT_STATS_GENRE}>{t('stats.genre_all')}</option>
						{availableGenres.map((item) => (
							<option key={item} value={item}>
								{item}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="stats-chart-container">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
						<CartesianGrid stroke="rgba(231, 231, 231, 0.15)" strokeDasharray="4 4" />
						<XAxis
							dataKey="label"
							stroke="#e7e7e7"
							tick={{ fill: '#e7e7e7', fontSize: 12 }}
						/>
						<YAxis
							allowDecimals={false}
							stroke="#e7e7e7"
							tick={{ fill: '#e7e7e7', fontSize: 12 }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(0, 0, 0, 0.9)',
								border: '1px solid #f5a623',
								borderRadius: '8px',
								color: '#e7e7e7',
								fontFamily: '"policeConthrax", sans-serif',
							}}
							labelStyle={{ color: '#e7e7e7' }}
							formatter={(value) => [value, t('stats.reviews')]}
						/>
						<Bar dataKey="count" fill="#f5a623" radius={[6, 6, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}

export default RatingDistributionChart
