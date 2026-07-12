import { useTranslation } from 'react-i18next'
import { STATS_PERIODS, getStatsYearOptions } from './statsUtils'

const StatsFilters = ({ period, fromYear, toYear, onPeriodChange, onYearRangeChange }) => {
	const { t } = useTranslation()
	const currentYear = new Date().getFullYear()
	const yearOptions = getStatsYearOptions()

	const periodOptions = [
		{ value: STATS_PERIODS.ALL, label: t('stats.period_all') },
		{ value: STATS_PERIODS.YEAR, label: t('stats.period_year', { year: currentYear }) },
		{ value: STATS_PERIODS.SIX_MONTHS, label: t('stats.period_six_months') },
	]

	const handleFromYearChange = (value) => {
		const nextFrom = Number(value)
		const nextTo = toYear ?? nextFrom
		onYearRangeChange(nextFrom, Math.max(nextFrom, nextTo))
	}

	const handleToYearChange = (value) => {
		const nextTo = Number(value)
		const nextFrom = fromYear ?? nextTo
		onYearRangeChange(Math.min(nextFrom, nextTo), nextTo)
	}

	return (
		<div className="stats-filters">
			<div className="stats-period-filter">
				<label className="stats-period-label" htmlFor="stats-period-select">
					{t('stats.period_label')}
				</label>
				<select
					id="stats-period-select"
					className="stats-period-select"
					value={period}
					onChange={(e) => onPeriodChange(e.target.value)}
				>
					{periodOptions.map(({ value, label }) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</div>

			<div className="stats-year-range-filter">
				<span className="stats-period-label">{t('stats.year_range_label')}</span>
				<div className="stats-year-range-inputs">
					<label className="stats-year-range-field">
						<span className="stats-year-range-field-label">{t('stats.year_from')}</span>
						<select
							className="stats-period-select"
							value={fromYear ?? ''}
							onChange={(e) => handleFromYearChange(e.target.value)}
						>
							<option value="" disabled>
								{t('stats.year_select')}
							</option>
							{yearOptions.map((year) => (
								<option key={`from-${year}`} value={year}>
									{year}
								</option>
							))}
						</select>
					</label>
					<span className="stats-year-range-separator">—</span>
					<label className="stats-year-range-field">
						<span className="stats-year-range-field-label">{t('stats.year_to')}</span>
						<select
							className="stats-period-select"
							value={toYear ?? ''}
							onChange={(e) => handleToYearChange(e.target.value)}
						>
							<option value="" disabled>
								{t('stats.year_select')}
							</option>
							{yearOptions.map((year) => (
								<option key={`to-${year}`} value={year}>
									{year}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>
		</div>
	)
}

export default StatsFilters
