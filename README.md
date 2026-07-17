*This project has been created as part of the 42 curriculum by rmiah, mdodevsk, yzeghari, dahmane, ufalzone*

# Transcendance
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE.svg?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C.svg?style=for-the-badge&logo=Prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800.svg?style=for-the-badge&logo=Grafana&logoColor=white)
![Vault](https://img.shields.io/badge/Vault-FFEC6E.svg?style=for-the-badge&logo=vault&logoColor=black)
![ModSecurity](https://img.shields.io/badge/ModSecurity-WAF-red.svg?style=for-the-badge)

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
| Make | GNU Make |
| Node.js (local dev only) | 20 LTS |
| OpenSSL | used by the cert generation script |

### Configuration

1. Clone the repository and copy the environment file at the project root:
   ```bash
   cp .env.example .env   # or create .env manually
   ```
2. Fill in the required variables in `.env`: database credentials (`DB_USER`, `DB_PASS`, `DB_NAME`), Grafana admin credentials, WAF settings, Google OAuth keys, mail credentials, and IGDB/Twitch API keys. You may need to create accounts to get certain API credentials (Twitch for exemple).

TLS certificates for the WAF and Vault are generated automatically on first `make up` if they are missing.

### Run with Make (recommended)

From the project root:

```bash
make        # alias for make up — starts the full stack in detached mode
```

`make up` checks that `.env` exists, generates TLS certificates if needed, then runs `docker compose up -d`.

For a fresh clone or after code changes:

```bash
make re     # stops containers, rebuilds images, and restarts the stack
```

**Other useful targets:**

| Command | Description |
|---------|-------------|
| `make down` | Stop all containers |
| `make logs` | Follow container logs |
| `make ps` | Show running services |
| `make rebuild SERVICE=<name>` | Rebuild and restart a single service (e.g. `make rebuild SERVICE=waf`) |
| `make clean` | Stop containers and remove volumes (resets the database) |
| `make fclean` | Full cleanup: images, volumes, certs, and Vault keys |

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

<img width="604" height="301" alt="Screenshot 2026-07-16 at 21 34 58" src="https://github.com/user-attachments/assets/1eb42fcc-2771-4b0c-9b49-013359371369" />

- **WAF (ModSecurity) + nginx**: single public entry point, TLS termination, request filtering.
- **Vault**: stores and injects secrets (DB credentials, API keys) into the backend at runtime instead of plain `.env` values.
- **Prometheus + Grafana**: collects metrics from backend, postgres and nginx, with custom dashboards and alerting rules.
- **Docker Compose**: the whole stack starts with a single command.

## Database Schema

<img width="1920" height="1080" alt="users" src="https://github.com/user-attachments/assets/962d1587-c996-4934-b5ee-ad5871a803f0" />
You can find more notes on the Database in /docs/notes/DEV_NOTES_DB_DANIYA.md

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
- **rmiah** :
  **Frontend framework & application shell**
  - Built the React 19 + Vite 8 SPA (14 pages, React Router, `fetch` API integration) with a multi-stage Docker build and nginx SPA fallback.

  **Design system & reusable components**
  - Shared visual identity (custom fonts, dark theme, `#f5a623` accent) and reusable components: navbars, `GamesCard`/`GamesCarousel`, `ReviewsCard`, `InscriptionForm`, chat UI, etc. Responsive layouts with mobile breakpoints.

  **Internationalization**
  - i18next setup (EN/FR/ES locale files), `useTranslation()` across pages, language switcher in Settings with `localStorage` persistence.

  **User-facing features (frontend)**
  - Login/signup, password reset, OAuth redirect handling, game browsing, reviews, friends feed, and Socket.IO chat interface.

  **Challenges overcome**
  - **SPA routing behind nginx:** `try_files` fallback for client-side routes on refresh.
  - **i18n at scale:** migrated hardcoded strings across all pages into locale files.
  - **OAuth callback flow:** handled token/user query params after Google redirect through the WAF/nginx chain.
- **mdodevsk** :
  **Infrastructure & orchestration**
  - Full **Docker Compose** stack (12+ services, healthchecks, volumes, startup ordering) and root **Makefile** for single-command deployment.
  - Architecture docs (`Flux.md`, `DEVOPS_NOTES_MARIO.md`) describing the Client → WAF → nginx → backend → Vault flow.

  **Reverse proxy (nginx)**
  - Internal nginx: API/WebSocket proxying, SPA serving, Grafana/Prometheus sub-path routing, `stub_status` for metrics.

  **Monitoring module**
  - Prometheus + Grafana with auto-provisioning (dashboards, alerting), custom dashboards (`backend`, `postgres`, `nginx`), and `prom-client` backend metrics.

  **Tech lead & integration**
  - Owned system architecture; integrated WAF and Vault stack with Yasser, migrating HTTP → HTTPS.

  **Challenges overcome**
  - **WAF blocking Grafana:** custom CRS exception for `/grafana/` outbound false positives.
  - **WebSocket proxy:** nginx `Upgrade`/`Connection` headers through the WAF chain.
  - **Cross-platform Docker permissions:** resolved Vault cert UID/GID issues between macOS and Linux.
- **yzeghari** : I initially worked on a separate GitHub repository to learn and experiment with the technologies and security mechanisms required for the project. Once the implementation was mature enough, I collaborated with the DevOps engineer (Mario) to integrate my work into the main project. We first deployed the infrastructure over HTTP, then migrated it to HTTPS, continuously improving and refining the security architecture throughout the development process.
- **dahmane** :
  **Database initialization & schema (ORM module)**
  - Designed the Prisma schema (13 models), `initPrisma.js` (Vault credentials), `initDatabase.js` (auto-sync, seeding, Vault DB role), and IGDB seed script.

  **Public API module**
  - Public REST API (`/api/public/games`, `/api/public/reviews`), API key auth with SHA-256 hashing, rate limiting, and Swagger docs at `/api-docs`.

  **Data & Analytics module / User activity analytics**
  - Stats API + frontend charts (playing list, ratings, genres, PDF export) and user activity endpoints (`/activity/:userId`, `/friends-activity`).

  **Challenges overcome**
  - **Schema drift:** automatic `--force-reset` fallback on `prisma db push` failure.
  - **Vault DB credentials:** Prisma pool wired to `vaultSecrets.DB_PASS` instead of plain `.env`.
  - **Stats aggregation:** split filter logic into dedicated utility modules per concern (date, genre, platform, rating).
- **ufalzone** :
  **Backend framework & core API**
  - Express 5 monolith (`index.js`): shared HTTP/Socket.IO server, route mounting, CORS, sessions, Passport, metrics.
  - Auth routes: register, login, password reset (nodemailer), JWT via Vault secrets.

  **Real-time chat (WebSockets)**
  - Socket.IO server with JWT handshake auth, chat events (send/read/typing), REST `/api/chat` API, friends-only enforcement, and rate limiting.

  **User interactions**
  - `/api/user` routes: follow, profiles, likes, playing list, favorites, reviews, comments, like/dislike.
  - IGDB integration (`/api/games`): discovery, search, on-demand game creation from API.

  **Google OAuth 2.0**
  - Passport Google strategy with auto-account creation, email conflict handling, and JWT redirect to frontend.

  **Challenges overcome**
  - **WebSocket proxy:** Socket.IO through nginx/WAF with `Upgrade` headers.
  - **OAuth behind reverse proxy:** `proxy: true` and WAF HTTPS callback URL for Passport.
  - **Google vs local accounts:** blocked conflicting email/password combinations on both sides.

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

**Justification:** The project subject requires a modern web framework on both sides. A React SPA for the frontend and an Express API for the backend provide a clear separation of concerns while staying deployable as a simple monolith.

**Implementation — Frontend (rmiah):**
- **React 19** + **Vite 8** SPA with **React Router 7** for client-side navigation across 14 pages.
- **Tailwind CSS 4** for utility-based styling alongside custom CSS per component.
- Vite dev server with `/api` proxy to the backend for local development.
- Multi-stage **Dockerfile**: `npm run build` in Node 20, then served as static files by nginx with SPA `try_files` fallback.

**Implementation — Backend (ufalzone):**
- **Express 5** monolith on **Node.js 20** (ES modules), single entry point in `src/index.js`.
- HTTP server shared with **Socket.IO** on the same port (no separate WebSocket service).
- Route mounting for internal API (`/api/games`, `/api/auth`, `/api/user`, `/api/chat`, etc.) and public API (`/api/public/*`).
- Middleware stack: CORS, JSON parsing, sessions (Passport OAuth), Prometheus metrics, rate limiting.
- Dockerized with a non-root `appuser`, Prisma client generation at build time.

Implemented by: rmiah (frontend), ufalzone (backend).

### Real-time features using WebSockets — Major (2pts)

**Justification:** Private messaging between friends requires instant delivery without polling. WebSockets provide low-latency, bidirectional communication ideal for chat, typing indicators, and read receipts.

**Implementation:**
- **Socket.IO** server attached to the same HTTP server as Express (`src/socket/index.js`), sharing port 4000.
- JWT authentication on socket connection via custom middleware (`authSocket.js`); each user joins a personal room (`user:{id}`).
- Chat events in `chatSocket.js`: send/receive messages, join/leave conversations, mark as read, typing indicators — all with acknowledgement callbacks.
- Messages persisted in PostgreSQL (`chat_messages` table) inside a Prisma transaction, then broadcast to all conversation participants via `message:new` and `conversation:updated` events.
- REST fallback API (`/api/chat`): list conversations, create direct chats, fetch message history, mark conversations as read.
- Safeguards: friends-only messaging, 10 messages per 10s rate limit, 2000-character max length.
- nginx reverse proxy configured with WebSocket upgrade headers; frontend connects via `socket.io-client` with JWT in `handshake.auth`.

Implemented by: ufalzone (backend), rmiah (frontend chat UI).

### User interactions — Major (2pts)

**Justification:** GameRev is a social platform — users need to follow each other, interact with reviews, manage game collections, and discover content. These interactions form the core engagement loop of the application.

**Implementation:**
- **Social graph:** follow/unfollow users, search by username, view public profiles (followers, following, reviews, collections).
- **Game collections:** like/unlike games, add/remove from playing list, manage top-4 favorite games on profile.
- **Reviews:** post, edit, delete reviews with half-star ratings (stored as integers ×2); browse all reviews and followed users' reviews.
- **Review interactions:** like/dislike toggle on reviews, threaded comments with nested replies (parentId).
- **Game discovery:** IGDB-powered routes (`/api/games`) for new releases, popular games, search, categories, game details, and screenshots — games auto-created in the local DB on first interaction.
- On-demand IGDB fetch: when a user likes or reviews a game not yet stored locally, the backend creates it from the IGDB API automatically.

Implemented by: ufalzone (backend), rmiah (frontend).

### Public API for the Database — Major (2pts)

**Justification:** The project subject requires exposing database data through a secured external API so third-party clients can read and write reviews programmatically. API keys per user ensure accountability, while rate limiting prevents abuse.

**Implementation:**
- Public REST routes under `/api/public/games` and `/api/public/reviews` (GET, POST, PUT, DELETE) with pagination on list endpoints.
- Authentication via `x-api-key` header: keys are generated/revoked in user settings, hashed with SHA-256 before storage, and validated by the `apiKeyAuth` middleware.
- Scope-based authorization (`regular` vs `admin`) for update/delete operations on reviews.
- Rate limiting at 100 requests per 15 minutes per API key (`express-rate-limit`).
- Input validation and HTML sanitization on review creation/update (`express-validator`, `sanitize-html`).
- Interactive Swagger documentation served at `/api-docs` (`swagger-jsdoc` + `swagger-ui-express`).

Implemented by: dahmane.

### ORM for the database — Minor (1pts)

**Justification:** Raw SQL queries across a growing schema would be error-prone and hard to maintain. An ORM provides type-safe queries, schema versioning, and a single source of truth for the data model.

**Implementation:**
- Full schema defined in `prisma/schema.prisma` (13 models: users, games, reviews, friendships, chat, API keys, etc.) with relations, unique constraints, and cascading deletes.
- Prisma Client configured with the `@prisma/adapter-pg` driver adapter and a PostgreSQL connection pool in `initPrisma.js`, using Vault-injected credentials.
- Automatic schema sync on backend startup via `prisma db push` in `initDatabase.js`, with a `--force-reset` fallback when the local DB is in an inconsistent state.
- Conditional seeding (`prisma/seed.js`) that fetches games from the IGDB API on first launch if the database is empty.
- Vault DB role provisioning through Prisma raw SQL queries (`ensureVaultDbRole`).

Implemented by: dahmane.

### Design system with reusable components — Minor (1pts)

**Justification:** With 14 pages sharing the same visual language, ad-hoc styling would lead to inconsistencies and duplicated code. A set of reusable layout and UI components keeps the app cohesive and speeds up development of new screens.

**Implementation:**
- **Layout shell:** `Background` (full-page overlay), `Footer` (logo, credits, legal links), and a dedicated navbar component per section (`HomeNavBar`, `GamesNavBar`, `ProfileNavBar`, `SettingsNavBar`, `ChatNavBar`, etc.).
- **Game & review UI:** `GamesCard`, `GamesCarousel`, `ReviewsCard`, `PostStars`, `PostGamePicker`, `GamePresentationReviews`, `GamePresentationScreenshots`.
- **Social & profile:** `FriendsList`, `FriendsActivity`, `ProfileFavorites`, `ProfileModal`, `NavAvatar`, `SearchBar`.
- **Auth:** `InscriptionForm` (login, signup, password reset flows in a single modal component).
- **Design tokens:** custom fonts (`policePS3`, `policeConthrax`), `#f5a623` accent on dark backgrounds, `clamp()` for responsive typography, and shared button/input styles across settings and forms.
- **Responsive behavior:** hamburger menu on mobile navbars, breakpoints at 600px and 900px in `index.css`.

Implemented by: rmiah.

## Modules - Accessibility and Internationalization

### Support for multiple languages — Minor (1pts)

**Justification:** GameRev targets an international audience. Supporting multiple languages makes the platform accessible to non-English speakers and is a required module of the subject.

**Implementation:**
- **i18next** + **react-i18next** configured in `i18n.js` with three locale files: `en.json`, `fr.json`, `es.json`.
- All major UI strings externalized (navigation, login, home, profile, friends, settings, chat, legal pages) and consumed via the `useTranslation()` hook.
- Language switcher in the Settings page with flag buttons (EN / FR / ES); selected language persisted in `localStorage` and restored on reload.
- Fallback language set to English if no preference is stored.

Implemented by: rmiah.

## Modules - User Management

### Remote authentication with OAuth 2.0 — Minor (1pts)

**Justification:** Requiring users to create yet another password increases friction. Google OAuth lets users sign in with an existing trusted account while still creating a local user record in our database.

**Implementation:**
- **Passport.js** with `passport-google-oauth20` strategy (`config/passport.js`).
- OAuth routes: `GET /api/auth/google` (redirect to Google with `profile` + `email` scopes) and `GET /api/auth/google/callback` (session auth → JWT generation → redirect to frontend).
- Auto-creates a new user on first Google login with a unique username derived from the Google display name.
- Email conflict handling: blocks OAuth if the email is already linked to a local password account; blocks password login on Google-only accounts (`passwordHash: 'google_oauth'`).
- Google Client ID and Secret stored in Vault, not in source code; `proxy: true` enabled for correct callback handling behind the WAF/nginx reverse proxy.
- Frontend receives the JWT and user object via URL query params on `/home` after successful OAuth.

Implemented by: ufalzone.

### User activity analytics — Minor (1pts)

**Justification:** A social gaming platform needs more than static profiles — users should see what their friends are doing (new reviews, likes, playing list updates) and browse any user's recent activity on their profile page.

**Implementation:**
- `GET /api/user/activity/:userId` — aggregates a user's 15 most recent actions (likes, reviews, follows, playing list additions) from multiple tables, merged and sorted by date.
- `GET /api/user/friends-activity` — fetches the same activity types for all followed users, enriched with user info (username, avatar), capped at 30 entries.
- Parallel Prisma queries (`Promise.all`) across `likedGame`, `review`, `friendship`, and `playingList` tables for performance.
- Consumed on the Home page (friends activity feed) and Friends page (`FriendsActivity` component).

Implemented by: dahmane.

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

## 1. WAF / ModSecurity

The WAF (Web Application Firewall) can either be embedded directly inside the Nginx container or deployed as a separate layer sitting between the Internet and Nginx. **The second architecture was chosen** for this project — a dedicated, standalone WAF container in front of Nginx.

Its role is to inspect every incoming HTTP request. Using the default rule sets — primarily the **OWASP Core Rule Set (CRS)** — along with custom rules defined in our configuration files, it decides whether a request should be allowed through or blocked.

### Hardened configuration constraint

The subject requires a **hardened configuration**, so the security/paranoia level could not simply be set to its lowest value for convenience. A high paranoia level significantly improves protection against real attacks (SQLi, XSS, path traversal, etc.), but it also increases the risk of **false positives** that can break legitimate application behavior.

To reconcile both requirements, custom rules were added on top of the default CRS ruleset — explicitly whitelisting legitimate request patterns specific to our application, while keeping the overall protection level high rather than lowering paranoia globally.

### Key configuration parameters

- **Rule engine**: blocking mode (`On`), not detection-only — required for a hardened setup.
- **Paranoia level**: kept high per subject requirements; false positives mitigated via custom rule exceptions rather than by lowering global paranoia.
- **Anomaly scoring thresholds** (inbound/outbound): tuned so legitimate traffic passes while attack patterns are still caught.
- **TLS termination**: handled at the WAF layer, in front of Nginx.
- **Audit logging**: JSON-formatted request logs for later analysis.

---

## 2. HashiCorp Vault

Vault is our secrets management system: a dedicated vault to store and retrieve passwords, API keys, certificates, and other sensitive credentials. It runs in its own container, and the backend queries Vault to fetch the secrets it needs (e.g., database credentials) before connecting to other services — instead of hardcoding them or passing them as plain environment variables.

### Design goal: configure Vault entirely from the outside

The main technical objective of this part was to configure Vault **without ever exec-ing into the Vault container manually**. Instead, a series of short-lived, purpose-built containers run Bash scripts making `curl` calls against the Vault HTTP API, then exit automatically once their task is done. This keeps the configuration process reproducible, scriptable, and auditable — no manual, undocumented steps against the running server.

### Container breakdown

| Container | Role |
|---|---|
| **`vault-init`** | Prepares the environment by fixing volume permissions before Vault's first start (Vault's process drops privileges to a non-root UID internally, so the underlying volume must be writable by that UID beforehand). |
| **`vault`** | The HashiCorp Vault server itself — encrypted, sealed storage for all secrets. |
| **`vault-unsealer`** | Vault is **sealed** after every restart by design. This container automatically unseals it using the unseal keys generated during the very first initialization and persisted in a dedicated volume. *(In a production environment, this manual-key unseal would typically be replaced by an **Auto-Unseal** mechanism backed by a KMS — AWS KMS, Azure Key Vault, Google Cloud KMS, or an HSM — removing the need to store raw unseal keys at all.)* |
| **`vault-bootstrap`** | Initializes Vault's configuration once unsealed: enables the KV secrets engine, writes access policies, configures authentication methods (AppRole for services, Userpass for the human admin), and provisions the roles needed by backend applications and operators. |
| **`vault-seeker`** | Reads secrets currently held as environment variables (API keys, credentials, passwords, etc.) and writes them into Vault via the KV secrets engine, which stores data as simple key/value pairs. This is effectively a one-time migration step: moving secrets out of `.env`-style variables and into Vault's encrypted storage. |
| **`vault-health`** | The only long-running container in this set. Unlike the others, it doesn't exit — it continuously polls Vault's status (sealed/unsealed, initialized, healthy) for monitoring purposes. |

### Root token lifecycle

The root token generated at initialization is used only once, by `vault-bootstrap`, to set up engines, policies, auth methods, and roles — then it is **revoked** immediately afterward. No long-lived root access remains; all further administrative operations go through a scoped admin user instead.

### Access model

- **AppRole authentication** for backend services, each bound to a dedicated policy restricting it to exactly the secret paths it needs (principle of least privilege) — e.g., a `backend-dev` role has no access whatsoever to production secrets, and vice versa.
- **Userpass authentication** for the human operator (devops/cyber role), used for manual administrative tasks after bootstrap.
- **KV secrets engine (v2)** stores static secrets — API keys, DB passwords, JWT secrets — as versioned key/value pairs, with read access scoped per policy.

### Known limitation (documented intentionally)

Because this is a school project without production KMS access, unseal keys and short-lived tokens are persisted on disk (in a restricted, non-versioned volume/directory) rather than through an Auto-Unseal/KMS setup. This is called out explicitly as a deliberate trade-off for the project's scope, with the production-grade alternative (KMS-backed Auto-Unseal) documented above.

---

## Summary

| Layer | Protects against | Mechanism |
|---|---|---|
| WAF / ModSecurity | Application-layer attacks (SQLi, XSS, etc.) on incoming HTTP traffic | OWASP CRS + custom rules, hardened paranoia level |
| Vault | Secret sprawl, hardcoded credentials, unrestricted secret access | Encrypted storage, scoped policies, AppRole isolation, revoked root token, audited access |

## Modules - Data & Analytics

### Analytics dashboard + data visualization - Major (2pts)

**Justification:** Users accumulate gaming data (playing list, ratings, genres) over time but have no way to visualize trends. A dedicated stats page with interactive charts and export turns raw data into actionable insights.

**Implementation:**
- Backend stats API (`/api/stats/`):
  - `GET /playinglist` — line chart of games added to the playing list over time.
  - `GET /rating-distribution` — bar chart of review ratings, filterable by genre.
  - `GET /game-genre-distribution` — pie chart of genres in the playing list, filterable by release year.
  - `GET /export` — PDF report generated server-side with `pdfkit`.
- Filtering by period (week, month, year, all time), custom year range, platform, and genre — logic split into utility modules (`statsDateUtils`, `statsGenreUtils`, `statsPlatformUtils`, `statsRatingUtils`, `statsExportUtils`).
- Frontend **Stats page** with Recharts components: `PlayingListStatsChart`, `RatingDistributionChart`, `GameGenreDistributionChart`, plus `StatsFilters` and `StatsExportButton`.

Implemented by: dahmane.

## Total
= 19pts
