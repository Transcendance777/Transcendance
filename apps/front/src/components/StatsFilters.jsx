import { useTranslation } from 'react-i18next'
import { STATS_PERIODS, getStatsYearOptions } from './statsUtils'

const StatsFilters = ({ period, filterYear, onPeriodChange, onFilterYearChange }) => {
	const { t } = useTranslation()
	const currentYear = new Date().getFullYear()
	const yearOptions = getStatsYearOptions()

	const periodOptions = [
		{ value: STATS_PERIODS.YEAR, label: t('stats.period_year', { year: currentYear }) },
		{ value: STATS_PERIODS.SIX_MONTHS, label: t('stats.period_six_months') },
	]

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

			<div className="stats-year-filter">
				<label className="stats-period-label" htmlFor="stats-year-select">
					{t('stats.year_range_label')}
				</label>
				<select
					id="stats-year-select"
					className="stats-period-select"
					value={filterYear ?? ''}
					onChange={(e) => {
						const value = e.target.value
						onFilterYearChange(value ? Number(value) : null)
					}}
				>
					<option value="">{t('stats.year_select')}</option>
					{yearOptions.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
			</div>
		</div>
	)
}

export default StatsFilters
