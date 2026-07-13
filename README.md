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
- Yasser (yzeghari) : As the team's cybersecurity lead, I was responsible for securing the project's infrastructure, reviewing my teammates' code to  ensure secure development practices, and designing and implementing all the security features required by the project specifications.
  - Ugo (ufalzone) :  [Brief description of their responsibilities (the backend dev)]

## Project Management
[How the team organized the work (task distribution, meetings, etc.).
◦ Tools used for project management (tools used : git/github, notion).
◦ Communication channels used (Discord).]

## Individual Contributions
- **rmiah** : -notes
- **mdodevsk** : -notes
- **yzeghari** : I initially worked on a separate GitHub repository to learn and experiment with the technologies and security mechanisms required for the project. Once the implementation was mature enough, I collaborated with the DevOps engineer (Mario) to integrate my work into the main project. We first deployed the infrastructure over HTTP, then migrated it to HTTPS, continuously improving and refining the security architecture throughout the development process.
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

-notes

## Total
= 19pts
