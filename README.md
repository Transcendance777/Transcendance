*This project has been created as part of the 42 curriculum by rmiah, mdodevsk, yzeghari, dahmane, ufalzone*

# Transcendance

## Description
[clearly presents the project, including its goal and a
brief overview, also contain a clear name for the project and its
key features]

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
[section listing classic references related to the topic (documen-
tation, articles, tutorials, etc.), as well as a description of how AI was used —
specifying for which tasks and which parts of the project]

# Technical Informations

## Technical Stack
[Frontend technologies and frameworks used.
◦ Backend technologies and frameworks used.
◦ Database system and why it was chosen.
◦ Any other significant technologies or libraries.
◦ Justification for major technical choices.]

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
- **Product Owner** Rydom (rmiah) : [Brief description of their responsibilities]
- **Project Manager** Daniya (dahmane) : [Brief description of their responsibilities]
- **Tech Lead** Mario (mdodevsk) : [Brief description of their responsibilities]
- **Developers** :
  - Yasser (yzeghari) : As the team's cybersecurity lead, I was responsible for securing the project's infrastructure, reviewing my teammates' code to  ensure secure development practices, and designing and implementing all the security features required by the project specifications.
  - Ugo (ufalzone) : Backend — Express API routes, authentication, Socket.IO chat, and IGDB integration.

## Project Management

The team organized work in two-week sprints with a shared backlog on **Notion** (module checklist, meeting notes). Tasks were assigned per module and tracked through **GitHub**.

- **Meetings:** twice-weekly syncs on Discord (planning + retrospective), plus ad-hoc calls for blockers.
- **Version control:** Git + GitHub (feature branches, PR reviews).
- **Communication:** Discord (daily chat, voice for pairing), Notion (docs and planning).

## Individual Contributions
- **rmiah** :
  **Frontend framework & application shell**
  - Built the entire React 19 + Vite 8 SPA: routing (`App.jsx`, `main.jsx` with `BrowserRouter`), page structure, and API integration via `fetch` across all pages.
  - Configured the Vite dev proxy (`/api` → backend) and the production multi-stage Docker build (Node build → nginx static serving with SPA fallback).
  - Implemented 14 pages: login/signup, home, games, game detail, reviews, post review, profile, other profile, friends, chat, settings, privacy, and terms.

  **Design system & reusable components**
  - Created the shared visual identity: custom fonts (`policePS3`, `policeConthrax`), dark theme with `#f5a623` accent, and the `Background` overlay layout used on every page.
  - Built reusable components: page-specific navbars (`HomeNavBar`, `GamesNavBar`, `ProfileNavBar`, etc.), `GamesCard`/`GamesCarousel`, `ReviewsCard`, `SearchBar`, `PostStars`, `InscriptionForm`, `Footer`, profile and friends components, and the full chat UI (`ChatWindow`, `ConversationList`, `MessageBubble`, etc.).
  - Responsive layouts with mobile hamburger menus and CSS breakpoints (600px / 900px).

  **Internationalization**
  - Set up i18next with translation files for English, French, and Spanish (`locales/en.json`, `fr.json`, `es.json`).
  - Externalized all major UI strings via `useTranslation()` and built the language switcher in Settings with `localStorage` persistence.

  **User-facing features (frontend)**
  - Login/signup flow with password reset UI, Google OAuth redirect handling, game browsing and detail pages, review posting, friends feed, and real-time chat interface (Socket.IO client integration).

  **Challenges overcome**
  - **SPA routing behind nginx:** configured `try_files` fallback so client-side routes work in production after a page refresh.
  - **i18n at scale:** progressively migrated hardcoded strings across 14 pages into locale files without breaking existing layouts.
  - **Consistent UI across many screens:** enforced a shared component and CSS convention (navbars, cards, modals) to avoid one-off styles and keep the app visually cohesive.
  - **OAuth callback flow:** handled the token/user query params on the Home page after Google redirect through the WAF/nginx proxy chain.
- **mdodevsk** :
  **Infrastructure & orchestration**
  - Designed and maintained the full **Docker Compose** stack (`infra/docker-compose.yaml`): 12+ services on a private `gamerev` bridge network, with healthchecks, volume persistence, and `depends_on` ordering (Postgres → Vault bootstrap → backend).
  - Wrote the root **Makefile** (`make up`, `make re`, `make rebuild`, `make logs`, `make clean`, `make fclean`) for single-command deployment, automatic TLS cert generation, and safe teardown.
  - Authored architecture documentation (`Flux.md`, `docs/DEVOPS_NOTES_MARIO.md`) describing the request flow (Client → WAF → nginx → backend → Vault) and operational runbooks.

  **Reverse proxy (nginx)**
  - Configured the internal nginx reverse proxy (`infra/nginx/nginx.conf`): API and WebSocket (`/socket.io/`) forwarding to the backend, SPA serving via the frontend container, and sub-path routing for Grafana (`/grafana/`) and Prometheus (`/prometheus/`).
  - Set up `stub_status` on port 8080 for nginx metrics export, with `X-Forwarded-Proto` headers so downstream services know the original request was HTTPS.

  **Monitoring module**
  - Deployed **Prometheus** + **Grafana** with automatic provisioning: datasource, dashboards, and alerting rules — no manual setup required on startup.
  - Created custom Grafana dashboards (`backend.json`, `postgres.json`, `nginx.json`) and configured `postgres-exporter` and `nginx-exporter` as scrape targets.
  - Integrated backend metrics via `prom-client` (`/metrics` endpoint, HTTP request counter and duration histogram middleware).

  **Tech lead & integration**
  - Owned overall system architecture (monolith backend, container-per-service, WAF as single entry point).
  - Collaborated with Yasser (cyber) to integrate the WAF and Vault stack into the main Compose file, migrating from HTTP to HTTPS and resolving cross-service compatibility issues.

  **Challenges overcome**
  - **WAF blocking Grafana:** ModSecurity phase-4 outbound scoring flagged Grafana's inline JavaScript as XSS — diagnosed via WAF logs and fixed with a custom CRS exception rule for `/grafana/` paths.
  - **WebSocket proxy:** configured nginx `Upgrade`/`Connection` headers and disabled buffering so Socket.IO handshakes work through the WAF → nginx → backend chain.
  - **Grafana/Prometheus sub-path routing:** proxied both services behind `/grafana/` and `/prometheus/` with correct `Host` and `X-Forwarded-Proto` headers so they work behind the WAF without direct public exposure.
  - **Cross-platform Docker permissions:** documented and resolved Vault certificate permission issues between macOS (Docker Desktop) and native Linux caused by UID/GID mismatches on bind mounts.
  - **Service startup ordering:** chained `depends_on` with healthcheck conditions so the backend only starts after Postgres is ready and Vault bootstrap has completed.
- **yzeghari** : I initially worked on a separate GitHub repository to learn and experiment with the technologies and security mechanisms required for the project. Once the implementation was mature enough, I collaborated with the DevOps engineer (Mario) to integrate my work into the main project. We first deployed the infrastructure over HTTP, then migrated it to HTTPS, continuously improving and refining the security architecture throughout the development process.
- **dahmane** :
  **Database initialization & schema (ORM module)**
  - Designed the full PostgreSQL schema in `prisma/schema.prisma` (users, games, reviews, friendships, chat, API keys, etc.) with proper relations, constraints, and cascading deletes.
  - Set up `initPrisma.js`: Prisma client with the `@prisma/adapter-pg` driver adapter and a PostgreSQL connection pool, reading the DB password from Vault at runtime.
  - Built `initDatabase.js`: automatic schema sync on startup (`prisma db push`), fallback force-reset on migration conflicts, conditional seeding via IGDB, and Vault DB role provisioning through raw SQL queries.
  - Wrote the seed script (`prisma/seed.js`) to populate the database with games fetched from the IGDB API on first launch.

  **Public API module**
  - Implemented the public REST API under `/api/public/games` and `/api/public/reviews` with pagination, scoped access, and input validation.
  - Built API key management: generation, revocation, and SHA-256 hashing before storage (`apiKeyAuth` middleware, `apiKey` controller and routes).
  - Added rate limiting (`express-rate-limit`) and interactive Swagger documentation at `/api-docs`.

  **Data & Analytics module / User activity analytics**
  - Backend stats API (`/api/stats/`): playing list over time, rating distribution, genre breakdown, with date/platform/year filters and PDF export (`pdfkit`).
  - Frontend stats page and chart components (`StatsPage`, `PlayingListStatsChart`, `RatingDistributionChart`, `GameGenreDistributionChart`, `StatsFilters`, `StatsExportButton`).
  - User activity endpoints: `/api/user/activity/:userId` (personal activity timeline) and `/api/user/friends-activity` (aggregated feed of followed users' likes, reviews, and playing list updates).

  **Challenges overcome**
  - **Schema drift across environments:** `prisma db push` could fail when the local DB was in an inconsistent state — solved with an automatic `--force-reset` fallback so the stack always starts cleanly on a fresh clone.
  - **Vault integration for DB credentials:** Prisma had to connect using secrets injected by Vault rather than plain `.env` values — wired the pg Pool to `vaultSecrets.DB_PASS` and documented the persistence model (Docker volumes vs. git-cloned state).
  - **Complex relational modelling:** self-referencing friendships (M2M on `users`), review likes/comments junction tables, and chat conversations required careful foreign key design to avoid orphan data — addressed with explicit `onDelete: Cascade` and unique composite constraints.
  - **Stats aggregation complexity:** filtering by period, year range, and platform across multiple tables — split logic into dedicated utility modules (`statsDateUtils`, `statsGenreUtils`, `statsPlatformUtils`, `statsRatingUtils`) to keep controllers readable.
  - **API key security:** keys are only shown once at generation; only the SHA-256 hash is stored in the database, preventing plaintext leakage if the DB is compromised.
- **ufalzone** :
  **Backend framework & core API**
  - Built the Express 5 monolith (`src/index.js`): HTTP server shared with Socket.IO, route mounting, CORS, sessions, Passport, and Prometheus metrics middleware.
  - Implemented authentication routes (`/api/auth`): registration, login (email or username), password reset via email (nodemailer), and JWT token generation using Vault-injected secrets.

  **Real-time chat (WebSockets)**
  - Socket.IO server (`src/socket/`): JWT authentication on handshake (`authSocket.js`), per-user rooms, and chat event handlers (`chatSocket.js`).
  - Real-time events: `message:send`, `message:read`, `conversation:join/leave`, `typing:start/stop` with acknowledgement callbacks.
  - REST chat API (`/api/chat`): conversation list, direct conversation creation, message history, read status, and unread counts.
  - Friends-only messaging enforcement (`chatFriendship.js`), message rate limiting (10 per 10s), and 2000-character cap.

  **User interactions**
  - User routes (`/api/user`): follow/unfollow, user search, public profiles, liked games, playing list, top-4 favorites.
  - Reviews: create/edit/delete, like/dislike toggle, threaded comments with replies.
  - IGDB integration (`services/igdb.js`, `/api/games`): game discovery, search, categories, screenshots — with Twitch OAuth token caching and query caching.

  **Google OAuth 2.0**
  - Passport.js Google strategy (`config/passport.js`): auto-account creation, unique username generation, email conflict detection with local accounts.
  - OAuth flow routes (`/api/auth/google`, `/api/auth/google/callback`): session-based auth, JWT issuance, redirect to frontend with token.

  **Challenges overcome**
  - **WebSocket proxy through nginx:** configured the reverse proxy with `Upgrade` and `Connection` headers so Socket.IO handshakes work behind the WAF/nginx chain.
  - **JWT auth on sockets:** implemented a custom Socket.IO middleware reading the token from `handshake.auth` or `Authorization` header, separate from Express REST middleware.
  - **OAuth behind reverse proxy:** enabled `proxy: true` on the Google strategy and set the callback URL to the WAF HTTPS endpoint so Passport receives the correct host/scheme.
  - **Google vs local account conflicts:** blocked OAuth login when the email already belongs to a password-based account (`email_conflict` redirect), and prevented password login on Google-only accounts.
  - **On-demand game creation:** when a user likes or reviews a game not yet in the local DB, the backend fetches it from IGDB and creates the record on the fly.

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
