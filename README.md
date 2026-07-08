# Transcendance
*This project has been created as part of the 42 curriculum by @RydomMh, @mariosrb, @Yassez, @ufalzone, @dna-ahm.*

## Description
**GameRev** is a web-based social platform designed for video game enthusiasts, heavily inspired by Letterboxd but tailored entirely for gaming. The application allows users to discover video games, rate them, write detailed reviews, and like their favorite titles. It serves as a social hub where gamers can interact in real-time, build a customized friends list, view peer profiles, and stay connected through dynamic activities.

### Key Features
* **Game Logging & Reviews:** Rate, review, and like video games to build a personal diary.
* **User Interactions:** Follow/add other users as friends and view their dynamic user profiles.
* **Real-Time Global Chat:** Connect with the community instantly via automated web sockets.
* **Interactive Analytics Dashboard:** Visualize personal gaming statistics, rating distributions, and platform-wide trends with interactive charts.
* **Public REST API:** A secure, documented API with rate-limiting to safely query game data.
* **Hardened Security:** Advanced defensive architecture featuring a Web Application Firewall (WAF) and centralized secrets isolation.

---

## Technical Stack
* **Frontend:** React (SPA framework utilizing styled components or a dedicated CSS utility framework).
* **Backend:** Node.js with Express (RESTful API architecture and WebSocket integration).
* **Database:** PostgreSQL (Robust relational database storing structured entity relationships securely).
* **Data Access Layer:** Prisma (Object-Relational Mapping (ORM) to handle type-safe database queries and migrations).
* **Infrastructure & Security:** Docker, Prometheus, Grafana, ModSecurity/WAF, and HashiCorp Vault.
