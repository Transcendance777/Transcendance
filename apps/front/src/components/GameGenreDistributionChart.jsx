import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts'
import {
	buildGenreStatsUrl,
	getStatsYearOptions,
} from './statsUtils'

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

const GameGenreDistributionChart = ({ statsFilter, refreshTick = 0 }) => {
	const { t } = useTranslation()
	const [distribution, setDistribution] = useState([])
	const [releaseYear, setReleaseYear] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const yearOptions = getStatsYearOptions()
	const filterKey = useMemo(
		() => `${JSON.stringify(statsFilter)}:${releaseYear ?? ''}`,
		[statsFilter, releaseYear],
	)
	const prevFilterKey = useRef(null)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) {
			setLoading(false)
			return
		}

		const showLoading = prevFilterKey.current !== filterKey
		prevFilterKey.current = filterKey

		const fetchStats = async () => {
			try {
				if (showLoading) {
					setLoading(true)
					setError(null)
				}

				const res = await fetch(
					buildGenreStatsUrl(statsFilter, releaseYear),
					{ headers: { Authorization: `Bearer ${token}` } },
				)

				if (!res.ok) throw new Error('fetch_failed')

				const json = await res.json()
				setDistribution(json.data ?? [])
			} catch {
				if (showLoading) setError(t('stats.load_error'))
			} finally {
				if (showLoading) setLoading(false)
			}
		}

		fetchStats()
	}, [filterKey, refreshTick, t])

	useEffect(() => {
		setReleaseYear(null)
	}, [statsFilter])

	const releaseFilter = (
		<div className="stats-chart-filter stats-release-filter">
			<label className="stats-period-label" htmlFor="stats-release-year-select">
				{t('stats.release_date_label')}
			</label>
			<select
				id="stats-release-year-select"
				className="stats-period-select"
				value={releaseYear ?? ''}
				onChange={(e) => {
					const value = e.target.value
					setReleaseYear(value ? Number(value) : null)
				}}
			>
				<option value="">{t('stats.release_select')}</option>
				{yearOptions.map((year) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>
		</div>
	)

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
		return (
			<div className="stats-chart-card">
				<div className="stats-chart-header">
					<h3 className="stats-chart-title">{t('stats.genre_distribution_title')}</h3>
					{releaseFilter}
				</div>
				<p className="stats-chart-message">{t('stats.no_genre_data')}</p>
			</div>
		)
	}

	return (
		<div className="stats-chart-card">
			<div className="stats-chart-header">
				<h3 className="stats-chart-title">{t('stats.genre_distribution_title')}</h3>
				{releaseFilter}
			</div>
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
