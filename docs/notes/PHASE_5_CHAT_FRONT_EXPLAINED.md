# Phase 5 - Interface frontend du chat

Date : 2026-07-11  
Branche : `ufalzone`

## Objectif

Cette phase ajoute une vraie page de messagerie a Game Rev sans changer l'identite visuelle du projet.

```text
REST       -> conversations, historique, recherche utilisateur
Socket.IO  -> connexion live, envoi, reception, lecture, saisie
React      -> affichage et interactions
```

Route ajoutee :

```text
/chat
/chat/:conversationId
```

## Analyse visuelle realisee avant implementation

Les pages principales ont ete ouvertes dans le navigateur local :

- Home : structure generale, panneaux et statistiques ;
- Games et Friends : navbars specialisees et etats sans donnees ;
- Settings : panneaux, formulaires, boutons, couleurs et espacement ;
- Profile et Reviews : structure et styles relus dans le code lorsque le backend empechait leur rendu complet.

La direction artistique observee :

```text
fond illustre floute
navbar noire fixe
panneaux noirs translucides
texte blanc casse #e7e7e7
accent orange #f5a623
bordures blanches discretes
animations courtes au survol
```

## Assets existants reutilises

Le projet possede peu d'assets locaux, ce qui rend son langage visuel coherent :

```text
apps/front/public/backgroundImage.jpg
apps/front/public/WebslingerBold-z8eEX.ttf
apps/front/public/Conthrax-SemiBold.otf
apps/front/public/faviconGameRev.svg
```

Utilisation dans le chat :

- `backgroundImage.jpg` reste le fond de page via `Background` ;
- Webslinger reste reserve au grand titre `Messages` ;
- Conthrax est utilise pour les textes, boutons et messages ;
- les avatars utilisent `avatarUrl` ou le fallback orange deja present dans le projet ;
- les icones viennent de `react-icons`, comme dans les autres pages.

Aucun nouveau framework CSS, aucune nouvelle image decorative et aucun asset genere n'ont ete ajoutes.

## Architecture frontend

### Services

```text
apps/front/src/services/chatApi.js
apps/front/src/services/socket.js
```

`chatApi.js` centralise les requetes REST avec le JWT :

```text
getConversations
getConversationMessages
createDirectConversation
markConversationRead
searchChatUsers
```

`socket.js` maintient une seule connexion Socket.IO pour tout le frontend :

```text
getSocket
connectSocket
disconnectSocket
```

Le token est transmis dans :

```text
socket.auth.token
```

Le socket est explicitement deconnecte au logout ou a la suppression du compte.

### Composants

```text
ChatNavBar
ConversationList
ChatWindow
MessageBubble
MessageComposer
NewConversationModal
```

Responsabilites :

- `ChatNavBar` reprend les conventions des navbars existantes ;
- `ConversationList` affiche avatar, dernier message, date et compteur non lu ;
- `ChatWindow` affiche la conversation selectionnee et l'etat de connexion ;
- `MessageBubble` distingue visuellement messages recus et envoyes ;
- `MessageComposer` limite les messages a 2000 caracteres ;
- `NewConversationModal` recherche un user et cree une conversation directe.

## Flux au chargement

```text
ouverture /chat
-> lecture localStorage.token et localStorage.user
-> GET /api/chat/conversations
-> connexion Socket.IO
-> affichage de la liste
```

Quand une conversation est selectionnee :

```text
navigation /chat/:id
-> conversation:join
-> GET historique REST
-> message:read par Socket.IO si connecte
-> fallback REST pour la lecture si le socket est indisponible
```

## Flux d'envoi

```text
saisie utilisateur
-> typing:start
-> message:send avec conversationId, body, clientId
-> backend sauvegarde en DB
-> message:new recu
-> ajout dans l'interface sans refresh
-> typing:stop
```

`clientId` permet d'identifier l'envoi cote client. L'interface deduplique egalement les messages avec leur `id` DB.

## Reception d'une nouvelle conversation

Un utilisateur peut recevoir un premier message alors que la conversation n'existait pas encore dans sa liste locale.

Dans ce cas :

```text
message:new ou conversation:updated inconnu
-> nouveau GET /api/chat/conversations
-> ajout de la conversation complete avec participants
```

Cela evite de construire une conversation incomplete uniquement a partir du message.

## Responsive

Desktop :

```text
liste des conversations | conversation active
```

Mobile :

```text
ecran 1 : liste
ecran 2 : conversation
```

Le bouton retour de la conversation revient a `/chat`. Les dimensions de la navbar, du composer et des avatars restent stables pour eviter les decalages de mise en page.

## Etats geres

- utilisateur non connecte ;
- chargement des conversations ;
- aucune conversation ;
- aucune conversation selectionnee ;
- historique vide ;
- erreur REST ;
- socket connecte ;
- socket en reconnexion ;
- indicateur de saisie ;
- compteur non lu ;
- recherche sans resultat.

## Securite frontend

- React rend le corps du message comme texte, pas comme HTML ;
- aucun `dangerouslySetInnerHTML` ;
- taille maximum de 2000 caracteres, egalement reverifiee par le backend ;
- JWT envoye a REST et au handshake Socket.IO ;
- aucun secret n'est ecrit dans le code frontend.

## Traductions

Toutes les chaines du chat existent dans :

```text
apps/front/src/locales/en.json
apps/front/src/locales/fr.json
apps/front/src/locales/es.json
```

## Verification de cette phase

Effectue :

- build Vite ;
- validation JSON des trois langues ;
- lint cible sur tous les nouveaux composants et services ;
- capture desktop ;
- capture mobile en 390 x 844 ;
- controle des dimensions DOM pour les debordements ;
- ouverture et cadrage de la modale nouvelle conversation.

Reste pour la phase 6 :

- deux comptes reels ;
- vrais messages via WAF, Nginx et Socket.IO ;
- verification PostgreSQL ;
- refresh et historique ;
- refus d'un troisieme utilisateur.
