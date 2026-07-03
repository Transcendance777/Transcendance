import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
	name: 'http_requests_total',
	help: 'Nombre total de requêtes HTTP',
	labelNames: ['method', 'route', 'status'],
	registers: [register],
});

export const httpRequestDuration = new client.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Durée des requêtes HTTP en secondes',
	labelNames: ['method', 'route', 'status'],
	registers: [register],
});

export function metricsMiddleware(req, res, next) {
	const start = process.hrtime.bigint();
	res.on('finish', () => {
		const route = req.route ? `${req.baseUrl}${req.route.path}` : req.path;
		const labels = { method: req.method, route, status: res.statusCode };
		httpRequestsTotal.inc(labels);
		const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
		httpRequestDuration.observe(labels, durationSeconds);
	});
	next();
}

export default register;
