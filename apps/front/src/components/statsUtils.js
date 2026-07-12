export const STATS_PERIODS = {
	ALL: 'all',
	YEAR: 'year',
	SIX_MONTHS: '6months',
	CUSTOM: 'custom',
}

export const DEFAULT_STATS_PERIOD = STATS_PERIODS.YEAR

export const MIN_STATS_YEAR = 1990

export const getStatsYearOptions = () => {
	const currentYear = new Date().getFullYear()
	return Array.from(
		{ length: currentYear - MIN_STATS_YEAR + 1 },
		(_, index) => currentYear - index,
	)
}

export const DEFAULT_STATS_PLATFORM = 'all'

export const buildStatsFilter = ({ period, fromYear, toYear }) => {
	const hasYearRange = fromYear != null && toYear != null

	return {
		period: hasYearRange ? STATS_PERIODS.CUSTOM : period,
		fromYear: hasYearRange ? Math.min(fromYear, toYear) : null,
		toYear: hasYearRange ? Math.max(fromYear, toYear) : null,
	}
}

export const buildStatsUrl = (path, filter) => {
	const { period, fromYear, toYear } = buildStatsFilter(filter)
	const params = new URLSearchParams({ period })

	if (fromYear != null && toYear != null) {
		params.set('fromYear', String(fromYear))
		params.set('toYear', String(toYear))
	}

	return `${path}?${params.toString()}`
}

export const buildPlayingListStatsUrl = (filter, platform = DEFAULT_STATS_PLATFORM) => {
	const url = buildStatsUrl('/api/stats/playinglist', filter)

	if (platform && platform !== DEFAULT_STATS_PLATFORM) {
		const [path, query] = url.split('?')
		const params = new URLSearchParams(query)
		params.set('platform', platform)
		return `${path}?${params.toString()}`
	}

	return url
}
