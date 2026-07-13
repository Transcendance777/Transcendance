*This project has been created as part of the 42 curriculum by rmiah, mdodevsk, yzeghari, dahmane, ufalzone*

# Transcendance

## Description
[clearly presents the project, including its goal and a
brief overview, also contain a clear name for the project and its
key features]

## Instructions
[containing any relevant information about compilation,
installation, and/or execution, should also mention all the needed prerequisites (software,
tools, versions, configuration like .env setup, etc.), and step-by-step instructions to
run the project]

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
  - Yasser (yzeghari) : [Brief description of their responsibilities (the cybersecurity dev)]
  - Ugo (ufalzone) :  [Brief description of their responsibilities (the backend dev)]

## Project Management
[How the team organized the work (task distribution, meetings, etc.).
◦ Tools used for project management (tools used : git/github, notion).
◦ Communication channels used (Discord).]

## Individual Contributions
- **rmiah** : -notes
- **mdodevsk** : -notes
- **yzeghari** : -notes
- **dahmane** : -notes
- **ufalzone** : -notes

# Modules & Features

## Features List
[Complete list of implemented features.
◦ Which team member(s) worked on each feature.
◦ Brief description of each feature’s functionality.]

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
