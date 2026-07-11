# Roadmap V1 - Chat Temps Reel Avec WebSocket

Mise a jour : 2026-07-11  
Branche : `ufalzone`  
Base actuelle : `dev` integree jusqu'au commit `7bf7ef7`

## Resume

Le chat reste une surcouche isolee. L'API existante des jeux, utilisateurs, reviews et cles API reste en REST.

```text
PostgreSQL = stockage durable
REST       = conversations et historique
Socket.IO  = nouveaux messages et etats en temps reel
```

L'architecture a change depuis la premiere roadmap :

```text
apps/backend/   backend Express, Prisma et Socket.IO
apps/front/     frontend React
infra/          Docker, WAF, Nginx, Vault et monitoring
docs/notes/     documentation du projet
```

Le trafic public suit maintenant ce chemin :

```text
Navigateur -> WAF :8443 -> Nginx -> backend :4000
```

## Etat global

| Phase | Etat | Resultat |
| --- | --- | --- |
| 0 - Integration de `dev` | Terminee | Nouvelle architecture fusionnee dans `ufalzone` |
| 1 - Modele DB | Terminee | Tables chat et relations Prisma |
| 2 - API REST chat | Terminee | Conversations, historique et lecture |
| 3 - WebSocket backend | Implementee | Socket.IO, auth JWT Vault, rooms et events |
| 4 - Proxy WAF/Nginx | Implementee | Route Nginx et exclusion CRS ciblee |
| 5 - Front chat | Implementee | Page chat, REST initial et temps reel |
| 6 - Tests E2E | Terminee | REST, Socket.IO, WAF, UI et PostgreSQL verifies |
| 7 - Friends-only et confort | Terminee | DM proteges et scroll naturel |

## Phase 1 - Modele DB du chat - Terminee

Schema : `apps/backend/prisma/schema.prisma`

Modeles ajoutes :

- `Conversation` : represente un fil de discussion ;
- `ConversationParticipant` : jointure entre users et conversations ;
- `ChatMessage` : stocke chaque message.

```text
Users -----< ConversationParticipant >----- Conversation -----< ChatMessage
```

Une conversation directe utilise une cle stable :

```text
user 3 + user 8 => directKey = "3:8"
```

Il n'y a pas une table par utilisateur.

## Phase 2 - API REST chat - Terminee

Route : `apps/backend/src/routes/chat.js`

```text
GET  /api/chat/conversations
POST /api/chat/conversations/direct/:userId
GET  /api/chat/conversations/:id/messages
POST /api/chat/conversations/:id/read
```

Regles conservees :

- JWT obligatoire ;
- verification de participation avant historique ou lecture ;
- messages stockes comme texte ;
- aucune modification de l'API REST existante.

## Phase 3 - WebSocket backend - Implementee

Dependance backend : `socket.io`.

Fichiers dedies :

```text
apps/backend/src/socket/index.js
apps/backend/src/socket/authSocket.js
apps/backend/src/socket/chatSocket.js
```

Raccord minimal dans `apps/backend/src/index.js` :

- creer un serveur HTTP avec `http.createServer(app)` ;
- initialiser Socket.IO sur ce serveur ;
- remplacer uniquement l'appel final a `app.listen`.

### Authentification adaptee a Vault

Le JWT n'est plus verifie avec une valeur lue directement dans `.env`.

```text
client -> auth.token -> authSocket -> vaultSecrets.JWT_SECRET
```

Le handshake refuse :

- un token absent ;
- un token invalide ou expire ;
- un user supprime de la DB.

Chaque socket authentifie rejoint automatiquement :

```text
user:{id}
```

Exemple : `user:8` permet de pousser un evenement a tous les onglets connectes du user 8.

### Events V1 backend

Client vers serveur :

```text
conversation:join
conversation:leave
message:send
message:read
typing:start
typing:stop
```

Serveur vers client :

```text
message:new
conversation:updated
message:read
typing:start
typing:stop
```

Tous les events avec callback repondent sous une forme stable :

```text
succes : { ok: true, ... }
erreur : { ok: false, error: { code, message } }
```

### Flux d'un message

```text
A emet message:send
-> JWT deja verifie au handshake
-> verification que A participe a la conversation
-> validation du texte et rate limit
-> insertion de ChatMessage dans PostgreSQL
-> mise a jour de Conversation.updatedAt
-> message:new vers les rooms user des participants
-> conversation:updated vers les participants
-> callback de confirmation vers A
```

Limites V1 :

- message vide refuse ;
- maximum 2000 caracteres ;
- maximum 10 messages par tranche de 10 secondes et par socket ;
- pas d'edition ni suppression ;
- pas de groupe dans l'interface V1.

Validation effectuee a cette etape : syntaxe Node, schema et generation Prisma, presence de Socket.IO et controle du diff. Le test avec deux vrais clients sera fait en phase 6, une fois le proxy et le frontend disponibles.

## Phase 4 - Proxy WAF et Nginx - Implementee

Le proxy ne concerne plus seulement Nginx. Il faut verifier les deux passages :

```text
Navigateur -> WAF -> Nginx -> Socket.IO
```

Travail realise :

1. ajout de `location /socket.io/` dans `infra/nginx/nginx.conf` ;
2. transmission de `Upgrade`, `Connection`, `Host` et des informations de proxy ;
3. exclusion de la seule regle CRS `920420`, uniquement pour les POST `/socket.io/` en `text/plain` ;
4. conservation de toutes les autres protections WAF.

Explication detaillee : `docs/notes/PHASE_4_SOCKET_PROXY_EXPLAINED.md`.

La validation fonctionnelle HTTPS avec deux utilisateurs reste dans la phase 6, apres creation du frontend.

## Phase 5 - Front chat - Implementee

Fichiers prevus :

```text
apps/front/src/services/socket.js
apps/front/src/services/chatApi.js
apps/front/src/pages/ChatPage.jsx
apps/front/src/components/chat/
apps/front/src/styles/ChatPage.css
```

Comportement :

- REST charge conversations et historique ;
- Socket.IO se connecte avec `localStorage.token` ;
- l'envoi passe par `message:send` ;
- `message:new` met l'interface a jour sans refresh ;
- le logout deconnecte le socket ;
- un refresh recharge l'historique depuis PostgreSQL.

Raccord minimal : route `/chat` dans `apps/front/src/App.jsx`.

Le projet utilise son CSS classique. Tailwind n'est pas requis pour le chat.

Explication detaillee et analyse des assets : `docs/notes/PHASE_5_CHAT_FRONT_EXPLAINED.md`.

## Phase 6 - Tests E2E - Terminee

Tests minimum :

1. creer deux utilisateurs A et B ;
2. A ouvre ou recupere une conversation avec B ;
3. A et B se connectent avec leur JWT sur Socket.IO ;
4. A envoie un message ;
5. B recoit `message:new` sans refresh ;
6. verifier le message dans PostgreSQL ;
7. B refresh et retrouve le message par REST ;
8. un user C ne peut ni rejoindre ni ecrire dans la conversation ;
9. un token invalide est refuse au handshake ;
10. verifier le trajet HTTPS complet via le WAF.

Tous ces controles ont ete executes avec trois utilisateurs de test et ont reussi.

Controles supplementaires valides :

- conversation directe unique ;
- conversation avec soi-meme refusee ;
- message vide et message de plus de 2000 caracteres refuses ;
- `typing:start`, `conversation:updated` et `message:read` recus en direct ;
- envoi depuis l'interface puis persistance apres actualisation.

Rapport detaille : `docs/notes/PHASE_6_CHAT_TEST_REPORT.md`.

Les anciennes routes REST ne font pas partie de notre implementation. Aucun probleme exterieur au chat n'a ete corrige pendant cette phase.

## Phase 7 - Friends-only et scroll - Terminee

La creation d'une conversation et l'envoi de messages demandent maintenant une relation `Friendship` avec le statut `accepted`.

Comme le projet enregistre actuellement les follows dans un seul sens, le chat considere le lien comme symetrique : si A suit B ou B suit A avec un statut accepte, A et B peuvent se repondre. Sans cette regle, la personne contactee ne pourrait pas repondre naturellement.

La recherche de DM affiche :

- les amis normalement avec une icone message ;
- les non-amis grises avec une icone ajouter ;
- apres l'ajout, le resultat devient immediatement contactable.

La protection est verifiee dans REST et Socket.IO. Le front seul n'est jamais considere comme une protection suffisante.

Le fil de messages :

- descend au dernier message lors de l'ouverture ;
- descend apres un message envoye par l'utilisateur ;
- reste en place lorsqu'un utilisateur remonte lire l'historique ;
- ne fait plus defiler toute la page.

Rapport detaille : `docs/notes/PHASE_7_FRIENDS_ONLY_SCROLL.md`.

## Bonus apres V1 stable

- presence online/offline partagee ;
- compteur non lu dans les autres pages ;
- bouton Message depuis profils et amis ;
- notifications generales ;
- groupes, edition ou suppression de messages.

## Interfaces publiques ajoutees

DB :

```text
Conversation
ConversationParticipant
ChatMessage
```

REST :

```text
GET  /api/chat/conversations
POST /api/chat/conversations/direct/:userId
GET  /api/chat/conversations/:id/messages
POST /api/chat/conversations/:id/read
```

Socket.IO :

```text
conversation:join
conversation:leave
message:send
message:new
conversation:updated
message:read
typing:start
typing:stop
```

Front :

```text
/chat
```

## Hypotheses actuelles

- tout utilisateur authentifie peut ouvrir une conversation directe avec un autre user ;
- les droits d'une conversation reposent sur `ConversationParticipant` ;
- le JWT Socket.IO utilise exactement le meme secret Vault que REST ;
- Socket.IO partage le port 4000 avec Express ;
- le proxy et le front restent des phases separees ;
- les changements non lies au chat restent hors scope de `ufalzone`.
