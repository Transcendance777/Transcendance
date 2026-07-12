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

const GameGenreDistributionChart = ({ statsFilter }) => {
	const { t } = useTranslation()
	const [distribution, setDistribution] = useState([])
	const [releaseFromYear, setReleaseFromYear] = useState(null)
	const [releaseToYear, setReleaseToYear] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const yearOptions = getStatsYearOptions()

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
					buildGenreStatsUrl(statsFilter, releaseFromYear, releaseToYear),
					{ headers: { Authorization: `Bearer ${token}` } },
				)

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
	}, [statsFilter, releaseFromYear, releaseToYear, t])

	useEffect(() => {
		setReleaseFromYear(null)
		setReleaseToYear(null)
	}, [statsFilter])

	const handleReleaseFromChange = (value) => {
		const nextFrom = Number(value)
		const nextTo = releaseToYear ?? nextFrom
		setReleaseFromYear(nextFrom)
		setReleaseToYear(Math.max(nextFrom, nextTo))
	}

	const handleReleaseToChange = (value) => {
		const nextTo = Number(value)
		const nextFrom = releaseFromYear ?? nextTo
		setReleaseFromYear(Math.min(nextFrom, nextTo))
		setReleaseToYear(nextTo)
	}

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
					<div className="stats-chart-filter stats-release-filter">
						<span className="stats-period-label">{t('stats.release_date_label')}</span>
						<div className="stats-year-range-inputs">
							<label className="stats-year-range-field">
								<span className="stats-year-range-field-label">{t('stats.release_from')}</span>
								<select
									className="stats-period-select"
									value={releaseFromYear ?? ''}
									onChange={(e) => handleReleaseFromChange(e.target.value)}
								>
									<option value="">{t('stats.release_select')}</option>
									{yearOptions.map((year) => (
										<option key={`release-from-${year}`} value={year}>
											{year}
										</option>
									))}
								</select>
							</label>
							<span className="stats-year-range-separator">—</span>
							<label className="stats-year-range-field">
								<span className="stats-year-range-field-label">{t('stats.release_to')}</span>
								<select
									className="stats-period-select"
									value={releaseToYear ?? ''}
									onChange={(e) => handleReleaseToChange(e.target.value)}
								>
									<option value="">{t('stats.release_select')}</option>
									{yearOptions.map((year) => (
										<option key={`release-to-${year}`} value={year}>
											{year}
										</option>
									))}
								</select>
							</label>
						</div>
					</div>
				</div>
				<p className="stats-chart-message">{t('stats.no_genre_data')}</p>
			</div>
		)
	}

	return (
		<div className="stats-chart-card">
			<div className="stats-chart-header">
				<h3 className="stats-chart-title">{t('stats.genre_distribution_title')}</h3>
				<div className="stats-chart-filter stats-release-filter">
					<span className="stats-period-label">{t('stats.release_date_label')}</span>
					<div className="stats-year-range-inputs">
						<label className="stats-year-range-field">
							<span className="stats-year-range-field-label">{t('stats.release_from')}</span>
							<select
								className="stats-period-select"
								value={releaseFromYear ?? ''}
								onChange={(e) => handleReleaseFromChange(e.target.value)}
							>
								<option value="">{t('stats.release_select')}</option>
								{yearOptions.map((year) => (
									<option key={`release-from-${year}`} value={year}>
										{year}
									</option>
								))}
							</select>
						</label>
						<span className="stats-year-range-separator">—</span>
						<label className="stats-year-range-field">
							<span className="stats-year-range-field-label">{t('stats.release_to')}</span>
							<select
								className="stats-period-select"
								value={releaseToYear ?? ''}
								onChange={(e) => handleReleaseToChange(e.target.value)}
							>
								<option value="">{t('stats.release_select')}</option>
								{yearOptions.map((year) => (
									<option key={`release-to-${year}`} value={year}>
										{year}
									</option>
								))}
							</select>
						</label>
					</div>
				</div>
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
