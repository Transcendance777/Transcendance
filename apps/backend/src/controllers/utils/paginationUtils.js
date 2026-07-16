const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePositiveInt = (value) => {
	if (value === undefined || value === '') {
		return null;
	}
	const parsed = Number(value);
	if (!Number.isInteger(parsed)) {
		return NaN;
	}
	return parsed;
};

/**
 * Parse and validate ?page=&limit= query params for paginated public API routes.
 * @returns {{ ok: true, page: number, limit: number, skip: number } | { ok: false, error: string }}
 */
const parsePaginationQuery = (query) => {
	const pageRaw = parsePositiveInt(query.page);
	const limitRaw = parsePositiveInt(query.limit);

	let page = DEFAULT_PAGE;
	let limit = DEFAULT_LIMIT;

	if (pageRaw !== null) {
		if (Number.isNaN(pageRaw) || pageRaw < 1) {
			return { ok: false, error: 'page must be a positive integer.' };
		}
		page = pageRaw;
	}

	if (limitRaw !== null) {
		if (Number.isNaN(limitRaw) || limitRaw < 1) {
			return { ok: false, error: 'limit must be a positive integer.' };
		}
		if (limitRaw > MAX_LIMIT) {
			return { ok: false, error: `limit must not exceed ${MAX_LIMIT}.` };
		}
		limit = limitRaw;
	}

	return { ok: true, page, limit, skip: (page - 1) * limit };
};

export { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, parsePaginationQuery };
