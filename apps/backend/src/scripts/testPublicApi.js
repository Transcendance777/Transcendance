import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const API_KEY = process.env.TEST_API_KEY;
const RATE_LIMIT_MAX = 100;

const isDocker = fs.existsSync('/.dockerenv');
const defaultBaseUrl = isDocker ? 'http://nginx:80' : 'https://localhost:8443';
const BASE_URL = (process.env.PUBLIC_API_BASE_URL || defaultBaseUrl).replace(/\/$/, '');

const client = axios.create({
	baseURL: BASE_URL,
	...(BASE_URL.startsWith('https://') && {
		httpsAgent: new https.Agent({ rejectUnauthorized: false }),
	}),
	validateStatus: () => true,
	headers: { 'x-api-key': API_KEY },
});

const results = [];

const record = (name, passed, detail = '') => {
	results.push({ name, passed, detail });
	const icon = passed ? 'PASS' : 'FAIL';
	console.log(`[${icon}] ${name}${detail ? ` — ${detail}` : ''}`);
};

const request = async (method, url, options = {}) => {
	const res = await client.request({ method, url, ...options });
	return res;
};

const assertStatus = (name, res, expected) => {
	const ok = res.status === expected;
	record(name, ok, `expected ${expected}, got ${res.status}`);
	return ok;
};

const runGetRouteTests = async () => {
	console.log('\n--- GET /api/public/games ---');

	const gamesRes = await request('GET', '/api/public/games', { params: { page: 1, limit: 5 } });
	if (!assertStatus('GET /api/public/games', gamesRes, 200)) return null;

	const games = gamesRes.data?.data;
	record('GET /api/public/games returns data array', Array.isArray(games), `length=${games?.length ?? 0}`);
	if (!games?.length) return null;

	const gameId = games[0].id;
	console.log(`\n--- GET /api/public/games/:id (id=${gameId}) ---`);

	const gameRes = await request('GET', `/api/public/games/${gameId}`);
	assertStatus(`GET /api/public/games/${gameId}`, gameRes, 200);
	record(
		'GET /api/public/games/:id returns matching game',
		gameRes.data?.id === gameId,
		`id=${gameRes.data?.id}`,
	);

	console.log(`\n--- GET /api/public/games/:id/reviews (id=${gameId}) ---`);

	const gameReviewsRes = await request('GET', `/api/public/games/${gameId}/reviews`, {
		params: { page: 1, limit: 5 },
	});
	assertStatus(`GET /api/public/games/${gameId}/reviews`, gameReviewsRes, 200);
	record(
		'GET /api/public/games/:id/reviews returns data array',
		Array.isArray(gameReviewsRes.data?.data),
		`length=${gameReviewsRes.data?.data?.length ?? 0}`,
	);

	console.log('\n--- GET /api/public/reviews ---');

	const reviewsRes = await request('GET', '/api/public/reviews', { params: { page: 1, limit: 5 } });
	if (!assertStatus('GET /api/public/reviews', reviewsRes, 200)) return;

	const reviews = reviewsRes.data?.data;
	record('GET /api/public/reviews returns data array', Array.isArray(reviews), `length=${reviews?.length ?? 0}`);
	if (!reviews?.length) return;

	const reviewId = reviews[0].id;
	console.log(`\n--- GET /api/public/reviews/:id (id=${reviewId}) ---`);

	const reviewRes = await request('GET', `/api/public/reviews/${reviewId}`);
	assertStatus(`GET /api/public/reviews/${reviewId}`, reviewRes, 200);
	record(
		'GET /api/public/reviews/:id returns matching review',
		reviewRes.data?.id === reviewId,
		`id=${reviewRes.data?.id}`,
	);
};

const runRateLimitTest = async () => {
	console.log(`\n--- Rate limit on GET /api/public/games (max ${RATE_LIMIT_MAX}/15min per API key) ---`);
	console.log('Sending requests until a 429 is received...');

	let successCount = 0;
	let rateLimited = false;
	let lastRateLimitHeaders = null;

	for (let i = 1; i <= RATE_LIMIT_MAX + 5; i += 1) {
		const res = await request('GET', '/api/public/games', { params: { page: 1, limit: 1 } });

		if (res.status === 200) {
			successCount += 1;
			lastRateLimitHeaders = {
				limit: res.headers['ratelimit-limit'],
				remaining: res.headers['ratelimit-remaining'],
				reset: res.headers['ratelimit-reset'],
			};
		} else if (res.status === 429) {
			rateLimited = true;
			record(
				'Rate limit triggered (429)',
				true,
				`after ${successCount} successful requests on attempt #${i}`,
			);
			record(
				'Rate limit error message',
				res.data?.error === 'Too many requests. Try again in 15 minutes.',
				JSON.stringify(res.data),
			);
			break;
		} else {
			record('Rate limit test unexpected status', false, `attempt #${i} returned ${res.status}`);
			return;
		}
	}

	if (!rateLimited) {
		record(
			'Rate limit triggered (429)',
			false,
			`sent ${RATE_LIMIT_MAX + 5} requests, got ${successCount} successes, no 429`,
		);
		return;
	}

	if (lastRateLimitHeaders?.limit) {
		record(
			'RateLimit-* headers present',
			Boolean(lastRateLimitHeaders.limit && lastRateLimitHeaders.remaining !== undefined),
			`limit=${lastRateLimitHeaders.limit}, remaining=${lastRateLimitHeaders.remaining}`,
		);
	}
};

const main = async () => {
	if (!API_KEY) {
		console.error('TEST_API_KEY is missing from .env');
		process.exit(1);
	}

	console.log(`Testing public API at ${BASE_URL}`);
	if (isDocker && !process.env.PUBLIC_API_BASE_URL) {
		console.log('Detected Docker: using internal nginx URL (override with PUBLIC_API_BASE_URL if needed).');
	}
	console.log(`Using TEST_API_KEY: ${API_KEY.slice(0, 8)}...`);

	await runGetRouteTests();
	await runRateLimitTest();

	const passed = results.filter((r) => r.passed).length;
	const failed = results.filter((r) => !r.passed).length;

	console.log(`\n--- Summary: ${passed} passed, ${failed} failed ---`);

	if (failed > 0) {
		process.exit(1);
	}
};

main().catch((error) => {
	if (error.code === 'ECONNREFUSED') {
		console.error(`Connection refused at ${BASE_URL}.`);
		if (isDocker) {
			console.error('Inside Docker, use http://nginx:80 (default) or https://waf:8443 via PUBLIC_API_BASE_URL.');
		} else {
			console.error('From your machine, use https://localhost:8443 (default) and ensure the stack is running.');
		}
	} else {
		console.error(error.message || error);
	}
	process.exit(1);
});
