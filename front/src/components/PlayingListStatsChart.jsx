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

const formatMonthLabel = (month, locale, year) =>
	new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(year, month - 1, 1))

const PlayingListStatsChart = () => {
	const { t, i18n } = useTranslation()
	const [year, setYear] = useState(null)
	const [monthlyData, setMonthlyData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) return

		const fetchStats = async () => {
			try {
				setLoading(true)
				setError(null)

				const res = await fetch('/api/stats/playinglist', {
					headers: { Authorization: `Bearer ${token}` },
				})

				if (!res.ok) throw new Error('fetch_failed')

				const json = await res.json()
				setYear(json.year)
				setMonthlyData(json.data ?? [])
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
			monthlyData.map(({ month, count }) => ({
				month,
				label: formatMonthLabel(month, i18n.language, year ?? new Date().getFullYear()),
				count,
			})),
		[monthlyData, i18n.language, year],
	)

	if (loading) {
		return <p className="stats-chart-message">{t('stats.loading')}</p>
	}

	if (error) {
		return <p className="stats-chart-message stats-chart-error">{error}</p>
	}

	return (
		<div className="stats-chart-card">
			<h3 className="stats-chart-title">
				{t('stats.playing_list_title', { year })}
			</h3>
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
