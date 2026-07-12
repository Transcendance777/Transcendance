# Transcendance

## Project Structure

```
apps/
  backend/        Express API backend (Prisma ORM)
  front/          React frontend (Vite)

infra/
  docker-compose.yaml   Single-command deployment
  nginx/                Reverse proxy configuration
  waf/                  ModSecurity WAF (custom rules, TLS certs)
  vault-stack/          HashiCorp Vault (bootstrap, unseal, secret seeding, healthcheck)
  monitoring/           Prometheus + Grafana (dashboards, alerting)
  scripts/              Infra helper scripts (certs generation, etc.)

docs/
  notes/          Team development notes
```

## Architecture (Devops)

The application is a **monolith**: one `backend` service handles all business logic, backed by a single PostgreSQL database, serving one `frontend`. This was a deliberate choice to avoid overengineering the project at this scale.

Each service runs in its own container. All containers communicate over a private Docker network, and only the reverse proxy is exposed to the outside.

<img width="646" height="325" alt="Screenshot 2026-07-12 at 20 55 54" src="https://github.com/user-attachments/assets/8a71fa0e-8d95-49d3-be4d-ca9bfa46ba04" />

- **WAF (ModSecurity) + nginx**: single public entry point, TLS termination, request filtering.
- **Vault**: stores and injects secrets (DB credentials, API keys) into the backend at runtime instead of plain `.env` values.
- **Prometheus + Grafana**: collects metrics from backend, postgres and nginx, with custom dashboards and alerting rules.
- **Docker Compose**: the whole stack starts with a single command.

## Modules (Devops)

### Monitoring — Major (2pts)

**Justification**: With multiple services running in containers (backend, database, reverse proxy), we needed visibility into their health and performance without manually checking logs. A monitoring stack lets us catch issues (high latency, DB overload, service down) before they become outages, and gives concrete metrics to show during evaluation.

**Implementation**:
- **Prometheus** scrapes metrics from the backend, PostgreSQL (via `postgres-exporter`) and nginx (via `nginx-exporter`) on a regular interval.
- **Grafana** visualizes these metrics through custom dashboards (`backend.json`, `postgres.json`, `nginx.json`), provisioned automatically at startup — no manual setup needed.
- **Alerting rules** (`alertes.yaml`) are configured in Grafana to flag abnormal conditions.
- Access to Grafana is restricted (not publicly exposed like the app itself).

Implemented by: mdodevsk.
