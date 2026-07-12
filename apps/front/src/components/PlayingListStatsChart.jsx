import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import { buildStatsUrl } from './statsUtils'

const formatMonthLabel = (month, locale, year, showYear) => {
	const date = new Date(year, month - 1, 1)
	const options = showYear
		? { month: 'short', year: 'numeric' }
		: { month: 'short' }
	return new Intl.DateTimeFormat(locale, options).format(date)
}

const PlayingListStatsChart = ({ statsFilter }) => {
	const { t, i18n } = useTranslation()
	const [monthlyData, setMonthlyData] = useState([])
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

				const res = await fetch(buildStatsUrl('/api/stats/playinglist', statsFilter), {
					headers: { Authorization: `Bearer ${token}` },
				})

				if (!res.ok) throw new Error('fetch_failed')

				const json = await res.json()
				setMonthlyData(json.data ?? [])
			} catch {
				setError(t('stats.load_error'))
			} finally {
				setLoading(false)
			}
		}

		fetchStats()
	}, [statsFilter, t])

	const showYearOnAxis = useMemo(() => {
		const years = new Set(monthlyData.map(({ year }) => year))
		return years.size > 1
	}, [monthlyData])

	const chartData = useMemo(
		() =>
			monthlyData.map(({ month, year, count }) => ({
				month,
				year,
				label: formatMonthLabel(month, i18n.language, year, showYearOnAxis),
				count,
			})),
		[monthlyData, i18n.language, showYearOnAxis],
	)

	if (loading) {
		return <p className="stats-chart-message">{t('stats.loading')}</p>
	}

	if (error) {
		return <p className="stats-chart-message stats-chart-error">{error}</p>
	}

	return (
		<div className="stats-chart-card">
			<h3 className="stats-chart-title">{t('stats.playing_list_title')}</h3>
			<div className="stats-chart-container">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
						<CartesianGrid stroke="rgba(231, 231, 231, 0.15)" strokeDasharray="4 4" />
						<XAxis
							dataKey="label"
							stroke="#e7e7e7"
							tick={{ fill: '#e7e7e7', fontSize: 12 }}
							interval={0}
							angle={-35}
							textAnchor="end"
							height={60}
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
							formatter={(value) => [value, t('stats.games')]}
						/>
						<Line
							type="monotone"
							dataKey="count"
							stroke="#f5a623"
							strokeWidth={2}
							dot={{ fill: '#f5a623', r: 4 }}
							activeDot={{ r: 6 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}

export default PlayingListStatsChart
