const VALID_PERIODS = new Set(['all', 'year', '6months', 'custom']);

const MIN_STATS_YEAR = 1990;
const MAX_STATS_YEAR = 2100;

const parseYear = (value) => {
	const year = Number(value);
	if (!Number.isInteger(year) || year < MIN_STATS_YEAR || year > MAX_STATS_YEAR) {
		return null;
	}
	return year;
};

const getStatsDateRange = (period) => {
	const now = new Date();

	if (period === 'year') {
		const year = now.getFullYear();
		return {
			start: new Date(year, 0, 1),
			end: new Date(year + 1, 0, 1),
			year,
			fromYear: null,
			toYear: null,
		};
	}

	if (period === '6months') {
		return {
			start: new Date(now.getFullYear(), now.getMonth() - 5, 1),
			end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
			year: null,
			fromYear: null,
			toYear: null,
		};
	}

	return { start: null, end: null, year: null, fromYear: null, toYear: null };
};

const parsePeriod = (req) => {
	const period = req.query.period ?? 'year';
	return VALID_PERIODS.has(period) ? period : 'year';
};

const resolveStatsDateRange = (req) => {
	const fromYear = parseYear(req.query.fromYear);
	const toYear = parseYear(req.query.toYear);

	if (fromYear !== null && toYear !== null) {
		const startYear = Math.min(fromYear, toYear);
		const endYear = Math.max(fromYear, toYear);

		return {
			period: 'custom',
			start: new Date(startYear, 0, 1),
			end: new Date(endYear + 1, 0, 1),
			year: null,
			fromYear: startYear,
			toYear: endYear,
		};
	}

	const period = parsePeriod(req);
	return {
		period,
		...getStatsDateRange(period),
	};
};

const buildDateFilter = (field, start, end) => {
	const filter = {};
	if (start) filter.gte = start;
	if (end) filter.lt = end;
	return Object.keys(filter).length ? { [field]: filter } : {};
};

const buildMonthBuckets = (start, end) => {
	const buckets = [];
	const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
	const limit = new Date(end);

	while (cursor < limit) {
		buckets.push({
			year: cursor.getFullYear(),
			month: cursor.getMonth() + 1,
			count: 0,
		});
		cursor.setMonth(cursor.getMonth() + 1);
	}

	return buckets;
};

const buildMonthlyStats = (entries, start, end) => {
	if (entries.length === 0) {
		return start && end ? buildMonthBuckets(start, end) : [];
	}

	const rangeStart = start ?? new Date(
		Math.min(...entries.map((entry) => entry.addedAt.getTime())),
	);
	const rangeStartMonth = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
	const rangeEnd = end ?? new Date(
		new Date().getFullYear(),
		new Date().getMonth() + 1,
		1,
	);

	const months = buildMonthBuckets(rangeStartMonth, rangeEnd);

	for (const entry of entries) {
		const bucket = months.find(
			({ year, month }) =>
				year === entry.addedAt.getFullYear() &&
				month === entry.addedAt.getMonth() + 1,
		);
		if (bucket) bucket.count++;
	}

	return months;
};

const parseReleaseYearRange = (req) => {
	const releaseFromYear = parseYear(req.query.releaseFromYear);
	const releaseToYear = parseYear(req.query.releaseToYear);

	if (releaseFromYear === null || releaseToYear === null) {
		return null;
	}

	const startYear = Math.min(releaseFromYear, releaseToYear);
	const endYear = Math.max(releaseFromYear, releaseToYear);

	return {
		start: new Date(startYear, 0, 1),
		end: new Date(endYear + 1, 0, 1),
		releaseFromYear: startYear,
		releaseToYear: endYear,
	};
};

const gameMatchesReleaseRange = (game, releaseRange) => {
	if (!releaseRange) return true;
	if (!game.releaseDate) return false;

	const releaseDate = new Date(game.releaseDate);
	return releaseDate >= releaseRange.start && releaseDate < releaseRange.end;
};

const MONTH_LABELS = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const formatPeriodLabel = ({ period, year, fromYear, toYear }) => {
	if (period === 'custom' && fromYear != null && toYear != null) {
		return `${fromYear} – ${toYear}`;
	}
	if (period === 'year' && year != null) {
		return `This year (${year})`;
	}
	if (period === '6months') {
		return 'Last 6 months';
	}
	return 'All time';
};

const formatMonthBucket = ({ month, year }) =>
	`${MONTH_LABELS[month - 1]} ${year}`;

export {
	resolveStatsDateRange,
	buildDateFilter,
	buildMonthlyStats,
	parseReleaseYearRange,
	gameMatchesReleaseRange,
	formatPeriodLabel,
	formatMonthBucket,
};
