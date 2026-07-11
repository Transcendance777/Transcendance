# Phase 7 - Chat friends-only et scroll naturel

Date : 2026-07-12
Branche : `ufalzone`

## Regle fonctionnelle

Un utilisateur ne peut creer une conversation directe ou envoyer un message que si une relation `Friendship` acceptee existe entre les deux participants.

La table actuelle est utilisee comme un follow unidirectionnel par le reste du projet. Pour le chat, une relation acceptee dans un sens suffit et rend le lien symetrique : les deux participants peuvent se repondre.

```text
A suit B avec status accepted
=> A peut contacter B
=> B peut repondre a A
```

## Protection backend

Service central :

```text
apps/backend/src/services/chatFriendship.js
```

Il est utilise par :

- REST lors de `POST /api/chat/conversations/direct/:userId` ;
- Socket.IO lors de `conversation:join` ;
- Socket.IO lors de `message:send`.

Un utilisateur non autorise recoit :

```text
HTTP 403
ou
FRIENDS_ONLY via Socket.IO
```

La suppression d'un ami bloque aussi les nouveaux messages d'une conversation deja existante. L'ancien historique reste lisible par ses participants.

## Recherche de DM

Nouvelle interface REST :

```text
GET /api/chat/users/search?q=username
```

Chaque resultat contient `isFriend`.

```text
isFriend: true  -> utilisateur normal + icone message
isFriend: false -> utilisateur grise + icone ajouter en ami
```

Le bouton ajouter reutilise `POST /api/user/friend-request/:userId`. Le projet acceptant actuellement ce lien immediatement, le resultat devient contactable sans recharger la recherche.

## Scroll du fil

Le scroll appartient maintenant uniquement a `.message-list`. La page, l'en-tete de conversation et le formulaire d'envoi restent fixes.

Regles :

- ouverture d'une conversation : aller au dernier message ;
- utilisateur deja en bas : suivre les nouveaux messages ;
- utilisateur remonte : conserver sa position pour un message recu ;
- utilisateur envoie un message : revenir au dernier message apres confirmation serveur.

## Tests executes

Tests automatises avec trois utilisateurs A, B et C :

| Controle | Resultat |
| --- | --- |
| A et B sans relation | Creation REST refusee en 403 |
| Recherche avant ajout | `isFriend: false` |
| Ajout de B par A | Reussi |
| Recherche apres ajout | `isFriend: true` pour A et B |
| Conversation A/B | Creee |
| Message A vers B | Recu en direct |
| Reponse B vers A | Recue en direct |
| Conversation A/C sans lien | Refusee |
| Suppression du lien A/B | Reussie |
| Message apres suppression | Refuse avec `FRIENDS_ONLY` |

Test interface :

- ligne non-ami grisee confirmee ;
- action `Add friend` confirmee ;
- transformation en `Send a message` confirmee ;
- fil long cree ;
- remontage manuel de 500 px ;
- envoi depuis cette position ;
- position finale exactement au bas du fil ;
- page reste a `scrollY = 0`.

Test responsive :

- mobile `390 x 844` : conversation plein ecran, compositeur visible et aucun debordement horizontal ;
- tablette `768 x 1024` : mode une colonne pour conserver une largeur de lecture confortable ;
- desktop `1440 x 900` : liste et conversation en deux colonnes ;
- la recherche de DM tient sur mobile avec les noms longs tronques proprement ;
- breakpoint une colonne fixe a `900px` pour inclure les tablettes.
