*This project has been created as part of the 42 curriculum by rmiah, mdodevsk, yzeghari, dahmane, ufalzone*

# Transcendance

## Description

**GameRev** is a social platform for video game enthusiasts, built as the final project of the 42 Transcendance curriculum. Users can discover games (via the IGDB API), write and browse reviews, manage a playing list and favorites, follow friends, chat in real time, and track their gaming habits through personal analytics.

**Key features:**
- User accounts with local registration, password reset, and Google OAuth 2.0 login
- Game discovery, reviews, likes/dislikes, threaded comments, and social following
- Real-time private messaging between friends (WebSockets / Socket.IO)
- Personal stats dashboard with charts and PDF export
- Public REST API secured by per-user API keys, documented with Swagger
- Full Docker Compose deployment with WAF, Vault, and monitoring stack

## Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2+ |
| Node.js (local dev only) | 20 LTS |
| OpenSSL | for certificate generation |

### Configuration

1. Clone the repository and copy the environment file at the project root:
   ```bash
   cp .env.example .env   # or create .env manually
   ```
2. Fill in the required variables in `.env`: database credentials (`DB_USER`, `DB_PASS`, `DB_NAME`), Grafana admin credentials, WAF settings, Google OAuth keys, mail credentials, and IGDB/Twitch API keys. You may need to create accounts to get certain API credentials (Twitch for exemple).
3. Generate self-signed TLS certificates for the WAF and Vault:
   ```bash
   bash infra/scripts/generate_certs.sh
   ```

### Run with Docker (recommended)

```bash
cd infra
docker compose up --build
```

The application is then available at:
- **App (HTTPS):** `https://localhost:8443`
- **Grafana:** `https://localhost:8443/grafana/`
- **Swagger (public API docs):** `https://localhost:8443/api-docs`

On first startup, Vault bootstraps automatically, seeds secrets into the backend, Prisma syncs the database schema, and seed data is inserted.

## Resources

**Documentation & references:**
- [React](https://react.dev/) — frontend framework
- [Vite](https://vite.dev/) — frontend build tool
- [Express](https://expressjs.com/) — backend framework
- [Prisma](https://www.prisma.io/docs) — ORM and schema management
- [Socket.IO](https://socket.io/docs/v4/) — real-time WebSocket communication
- [IGDB API](https://api-docs.igdb.com/) — game metadata
- [HashiCorp Vault](https://developer.hashicorp.com/vault/docs) — secrets management
- [ModSecurity / OWASP CRS](https://coreruleset.org/) — WAF rules
- [Prometheus](https://prometheus.io/docs/) & [Grafana](https://grafana.com/docs/) — monitoring
- [i18next](https://www.i18next.com/) — internationalization
- [Recharts](https://recharts.org/) — data visualization

**AI usage:**
AI tools (Cursor / ChatGPT) were used during development for:
- Drafting and reviewing documentation (README, DevOps notes)
- Exploring boilerplate patterns (Swagger setup, Docker Compose service wiring)
- Debugging assistance (WAF false positives, Vault permission issues)
- Generating seed/test scripts

All architectural decisions, security configuration, and business logic were implemented and reviewed by the team.

# Technical Informations

## Technical Stack

**Frontend**
- **React 19** with **Vite 8** — component-based SPA with fast HMR during development
- **React Router 7** — client-side routing
- **Tailwind CSS 4** — utility-first styling
- **i18next / react-i18next** — multi-language support (EN, FR, ES)
- **Recharts** — interactive charts for the stats dashboard
- **Socket.IO client** — real-time chat

**Backend**
- **Node.js 20** with **Express 5** — REST API monolith
- **Socket.IO** — WebSocket server sharing the HTTP port
- **Passport.js** + **passport-google-oauth20** — Google OAuth 2.0
- **JWT** + **bcrypt** — token-based auth and password hashing
- **express-validator**, **sanitize-html**, **express-rate-limit** — input validation and abuse prevention
- **prom-client** — Prometheus metrics endpoint
- **Swagger (swagger-jsdoc + swagger-ui-express)** — public API documentation

**Database**
- **PostgreSQL 18** — relational database chosen for ACID compliance, mature ecosystem, and strong support for complex relations (friendships, reviews, chat). Fits the social + review data model naturally.
- **Prisma 7** — type-safe ORM with schema migrations and seeding

**Infrastructure & security**
- **Docker Compose** — single-command orchestration of all services
- **nginx** — internal reverse proxy (API, WebSocket upgrade, Grafana sub-path)
- **ModSecurity WAF** — TLS termination, OWASP CRS request/response filtering
- **HashiCorp Vault** — runtime secret injection (JWT, OAuth, mail) via AppRole
- **Prometheus + Grafana** — metrics collection and dashboards

**Justification for major choices:**
- **Monolith backend** over microservices: the project scope does not justify the operational overhead of multiple services.
- **PostgreSQL + Prisma** over raw SQL or NoSQL: structured relational data (users, games, reviews, friendships) with clear foreign keys and Prisma's developer ergonomics.
- **Vault** over plain `.env` in production: secrets are not baked into images and can be rotated without redeploying.
- **WAF as single entry point**: all external traffic is inspected before reaching internal services.

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

## Database Schema

-notes

# Team Information
- **Product Owner** Rydom (rmiah) : Defines product vision and feature priorities, validates UX flows and acceptance criteria, and ensures deliverables match the project subject requirements.
- **Project Manager** Daniya (dahmane) : Coordinates sprints and task distribution, maintains documentation and the README, and owns database design and Prisma schema decisions.
- **Tech Lead** Mario (mdodevsk) : Owns overall architecture, Docker Compose stack, monitoring (Prometheus/Grafana), nginx reverse proxy, and CI/deployment workflows.
- **Developers** :
  - Yasser (yzeghari) : Cybersecurity — WAF/ModSecurity configuration, HashiCorp Vault bootstrap and secret management, TLS certificates, and security hardening.
  - Ugo (ufalzone) : Backend — Express API routes, authentication, Socket.IO chat, and IGDB integration.

## Project Management

The team organized work in two-week sprints with a shared backlog on **Notion** (module checklist, meeting notes). Tasks were assigned per module and tracked through **GitHub**.

- **Meetings:** twice-weekly syncs on Discord (planning + retrospective), plus ad-hoc calls for blockers.
- **Version control:** Git + GitHub (feature branches, PR reviews).
- **Communication:** Discord (daily chat, voice for pairing), Notion (docs and planning).

## Individual Contributions
- **rmiah** : -notes
- **mdodevsk** : -notes
- **yzeghari** : -notes
- **dahmane** : -notes
- **ufalzone** : -notes

# Modules & Features

## Features List

| Feature | Members | Description |
|---------|---------|-------------|
| User registration & login | ufalzone, rmiah | Email/password signup, JWT sessions, password reset via email |
| Google OAuth 2.0 | ufalzone | One-click login with Google, auto-account creation |
| Game discovery (IGDB) | ufalzone, rmiah | Browse, search, and view game details with covers and metadata |
| Reviews & ratings | ufalzone, rmiah | Post, edit, delete reviews; half-star ratings; like/dislike and threaded comments |
| Playing list & favorites | ufalzone, rmiah | Track games currently playing and pin top 4 favorites on profile |
| Friends & activity feed | ufalzone, rmiah | Follow users, view friends' recent likes/reviews/playing activity |
| Real-time chat | ufalzone, rmiah | Private messaging between friends via Socket.IO |
| Stats dashboard | dahmane | Personal analytics: playing list over time, rating distribution, genre breakdown, PDF export |
| Public REST API | dahmane | API-key-authenticated endpoints for games and reviews, rate-limited, Swagger docs |
| Multi-language UI | rmiah | English, French, and Spanish via i18next, switchable in settings |
| Monitoring stack | mdodevsk | Prometheus metrics + Grafana dashboards for backend, Postgres, nginx |
| WAF + Vault | yzeghari | ModSecurity WAF as public entry point; Vault for runtime secret injection |

## Modules - Web

### Framework for both the frontend and backend — Major (2pts)

-notes

### Real-time features using WebSockets — Major (2pts)

-notes

### User interactions — Major (2pts)

-notes

### Public API for the Database — Major (2pts)

-notes

### ORM for the database — Minor (1pts)

-notes

### Design system with reusable components — Minor (1pts)

-notes

## Modules - Accessibility and Internationalization

-notes

### Support for multiple languages — Minor (1pts)

-notes

### Support for multiple languages — Minor (1pts)

-notes

## Modules - User Management

### Remote authentication with OAuth 2.0 — Minor (1pts)

-notes

### User activity analytics — Minor (1pts)

-notes

## Modules - Devops

### Monitoring — Major (2pts)

**Justification**: With multiple services running in containers (backend, database, reverse proxy), we needed visibility into their health and performance without manually checking logs. A monitoring stack lets us catch issues (high latency, DB overload, service down) before they become outages, and gives concrete metrics to show during evaluation.

**Implementation**:
- **Prometheus** scrapes metrics from the backend, PostgreSQL (via `postgres-exporter`) and nginx (via `nginx-exporter`) on a regular interval.
- **Grafana** visualizes these metrics through custom dashboards (`backend.json`, `postgres.json`, `nginx.json`), provisioned automatically at startup — no manual setup needed.
- **Alerting rules** (`alertes.yaml`) are configured in Grafana to flag abnormal conditions.
- Access to Grafana is restricted (not publicly exposed like the app itself).

Implemented by: mdodevsk.

## Modules - Cyber

### Implement WAF/ModSecurity + HashiCorp - Major (2pts)

-notes

## Modules - Data & Analytics

### Analytics dashboard + data visualization - Major (2pts)

-notes

## Total
= 19pts
