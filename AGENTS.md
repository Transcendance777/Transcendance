# AGENTS.md - Instructions projet Transcendance / Game Rev

## Contexte

Ce depot contient le projet Transcendance / Game Rev.

Game Rev est une application web sociale autour des jeux video. Les utilisateurs peuvent s'inscrire, se connecter, consulter des jeux, publier des reviews, liker/commenter des reviews, gerer leurs jeux favoris, suivre d'autres utilisateurs et consulter l'activite sociale.

La branche de travail pour notre partie est :

```text
ufalzone
```

Elle a ete creee depuis :

```text
origin/dev
```

## Regles de travail

- Ne pas modifier le code existant sans demande explicite.
- Quand une fonctionnalite doit etre ajoutee, privilegier des fichiers/modules dedies.
- Garder les changements scopes a notre partie.
- Ne pas refactorer les fichiers existants juste pour les rendre plus propres.
- Ne pas casser les routes, composants ou schemas existants.
- Documenter les choix importants dans `notes/`.
- Toujours expliquer les notions techniques au fur et a mesure, avec des definitions simples, des exemples concrets et le lien avec ce projet.
- Ne pas supposer que les termes comme Prisma, migration, schema, middleware, websocket, route, room, JWT ou ORM sont deja acquis.
- Avant de proposer une implementation, expliquer a quoi sert chaque morceau et pourquoi il est necessaire.
- Avancer etape par etape sur ce projet : ne pas enchainer plusieurs phases d'implementation sans validation explicite.
- Pour chaque etape, expliquer l'objectif, les fichiers concernes, les risques, puis attendre l'accord avant de passer a l'etape suivante.
- Quand une roadmap existe, traiter uniquement l'etape en cours et laisser les suivantes sous forme de discussion ou TODO.
- Utiliser `rtk` devant les commandes shell.
- Verifier la branche avec `rtk git status --short --branch` avant les changements importants.
- Ne pas utiliser de commandes destructrices Git (`reset --hard`, checkout destructif, clean force) sans demande explicite.

## Architecture actuelle

### Backend

Dossier :

```text
backend/
```

Stack :

- Node.js 20
- Express 5
- Prisma 7
- PostgreSQL
- JWT
- Passport Google OAuth
- bcrypt

Points importants :

- Entree backend : `backend/src/index.js`
- Prisma client : `backend/src/init/initPrisma.js`
- Middleware JWT : `backend/src/middleware/auth.js`
- Auth : `backend/src/routes/auth.js`
- Routes utilisateurs/social : `backend/src/routes/user.js`
- Routes jeux : `backend/src/routes/games.js`
- Service IGDB/Twitch : `backend/src/services/igdb.js`
- Schema DB : `backend/prisma/schema.prisma`

Le backend monte actuellement :

```text
/api/games
/api/auth
/api/user
```

### Frontend

Dossier :

```text
front/
```

Stack :

- React 19
- Vite 8
- React Router
- i18next
- CSS par page/composant
- react-icons
- socket.io-client deja present

Points importants :

- Entree front : `front/src/main.jsx`
- Routes React : `front/src/App.jsx`
- Pages : `front/src/pages/`
- Composants : `front/src/components/`
- Styles : `front/src/styles/`
- Traductions : `front/src/locales/en.json`, `fr.json`, `es.json`

Le front stocke l'auth dans :

```text
localStorage.token
localStorage.user
```

### Infrastructure

Fichiers principaux :

```text
docker-compose.yaml
docker-compose.override.yaml
nginx/nginx.conf
Makefile
monitoring/
```

Services Docker :

- frontend
- backend
- postgres
- nginx
- prometheus
- grafana
- postgres-exporter
- nginx-exporter

Nginx route actuellement :

```text
/api/     -> backend:4000
/         -> frontend:80
/grafana/ -> grafana:3000
```

Pour des websockets Socket.IO, il faudra prevoir un proxy `/socket.io/` avec headers `Upgrade`.

## Base de donnees

Le schema Prisma principal contient :

- `Users`
- `ApiKey`
- `Game`
- `Review`
- `ReviewLike`
- `ReviewComment`
- `LikedGame`
- `PlayingList`
- `Friendship`
- `FavoriteGame`
- `login_test` ancienne table de test

Relations importantes :

- `Users` -> `Review`
- `Game` -> `Review`
- `Users` <-> `Game` via `LikedGame`
- `Users` <-> `Game` via `PlayingList`
- `Users` <-> `Game` via `FavoriteGame`
- `Users` <-> `Users` via `Friendship`
- `Review` -> `ReviewComment`
- `ReviewComment` -> `ReviewComment` pour les reponses

La table `Friendship` est actuellement plutot un systeme de follow unidirectionnel, meme si le nom suggere une amitie.

## Notre partie prevue

Objectif futur :

- ajouter des websockets ;
- ajouter un systeme de chat entre utilisateurs ;
- faire front et back ;
- garder la fonctionnalite isolee autant que possible.

Approche recommandee :

- utiliser Socket.IO, car `socket.io-client` est deja installe cote front ;
- ajouter `socket.io` cote backend ;
- garder REST pour l'historique et les conversations ;
- utiliser websocket pour le temps reel ;
- authentifier le websocket avec le JWT existant ;
- stocker les messages en PostgreSQL via Prisma ;
- ajouter des tables dediees pour conversations, participants et messages.

Fichiers probables pour la future implementation :

```text
backend/src/routes/chat.js
backend/src/socket/index.js
backend/src/socket/authSocket.js
backend/src/socket/chatSocket.js
front/src/services/socket.js
front/src/services/chatApi.js
front/src/pages/ChatPage.jsx
front/src/components/chat/
front/src/styles/ChatPage.css
```

## Documentation projet

Analyse complete deja redigee :

```text
notes/PROJECT_ANALYSIS_WEBSOCKET_CHAT_PLAN.md
```

Avant de coder le chat, relire ce document.

## Points de vigilance

- `socket.io-client` existe cote front, mais `socket.io` manque cote backend.
- `backend/src/index.js` utilise `app.listen`; Socket.IO demandera un serveur HTTP partage.
- Nginx ne proxy pas encore les upgrades websocket.
- `.env.example` contient des valeurs qui ressemblent a des vrais secrets ; a traiter avec prudence.
- `SettingsPage.jsx` semble appeler `/api/apikey`, mais aucune route `/api/apikey` n'est montee dans `backend/src/index.js`.
- `prisma db push` est lance au demarrage backend ; pratique en dev, plus risque en production.
- Il n'y a pas encore de vrais tests automatises.

## Commandes utiles

Toujours prefixer avec `rtk`.

```bash
rtk git status --short --branch
rtk git branch
rtk npm install
rtk npm run build
rtk docker compose ps
rtk make up
rtk make logs
```

## Style attendu

- Garder du JavaScript ESM coherent avec le backend actuel.
- Garder les composants React en JSX comme le front actuel.
- Respecter les fichiers CSS existants plutot qu'introduire un nouveau systeme de style.
- Ajouter les traductions si une UI utilisateur est creee.
- Garder les messages et noms de routes clairs.
- Favoriser la securite : validation des payloads, verification de participation aux conversations, pas de rendu HTML des messages.
