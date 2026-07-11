# Phase 6 - Rapport de test du chat

Date : 2026-07-11
Branche : `ufalzone`

## Objectif

Verifier le chat dans les memes conditions generales que les correcteurs : pile Docker, Vault, PostgreSQL, frontend, backend, Nginx et WAF.

Le trafic teste suit ce chemin :

```text
Frontend -> WAF -> Nginx -> REST / Socket.IO -> PostgreSQL
```

## Demarrage

La commande du projet `make up` a ete essayee en premier. Sur cette machine, le plugin `docker compose` n'est pas installe, alors que le binaire compatible `docker-compose` est disponible. La pile a donc ete lancee avec les deux fichiers Compose et le fichier `.env`, sans modifier le Makefile.

La configuration locale `.env`, ignoree par Git, a ete completee pour permettre l'initialisation Vault. Aucun secret n'est consigne dans ce document.

## Tests automatises

Un scenario temporaire, non ajoute au depot, a cree trois utilisateurs A, B et C.

Resultats :

| Controle | Resultat |
| --- | --- |
| Route REST sans JWT | `401 Token manquant` |
| Handshake Engine.IO via WAF | `200`, upgrade WebSocket propose |
| JWT Socket.IO invalide | Connexion refusee |
| Creation conversation A/B | Reussie |
| Deuxieme creation A/B | Meme conversation retournee |
| Conversation avec soi-meme | Refusee en `400` |
| A et B rejoignent la room | Reussi |
| C rejoint la room A/B | Refuse avec `FORBIDDEN` |
| Message vide | Refuse avec `INVALID_MESSAGE` |
| Message de 2001 caracteres | Refuse avec `MESSAGE_TOO_LONG` |
| Indicateur de saisie A vers B | Recu en direct |
| Message A vers B | `message:new` recu sans refresh |
| Mise a jour de conversation | `conversation:updated` recu |
| Lecture B vers A | `message:read` recu |
| Envoi de C dans A/B | Refuse avec `FORBIDDEN` |
| Historique de A et B | Accessible en REST |
| Historique demande par C | Refuse en `403` |
| Marquage lu REST | Reussi |
| Historique apres deconnexion | Message toujours present |

## Verification PostgreSQL

Apres le premier scenario, PostgreSQL contenait exactement :

```text
1 conversation
2 participants
1 message
```

Le corps lu directement dans `chat_messages` correspondait au message recu par Socket.IO. Cela confirme que le backend sauvegarde avant de diffuser et que le message ne vit pas seulement en memoire.

## Verification interface

L'interface complete a ete ouverte via le WAF local, puis un utilisateur de test s'est connecte.

Parcours valide :

1. ouverture de `/chat/:conversationId` ;
2. conversation et ancien message visibles ;
3. saisie et envoi d'un nouveau message ;
4. nouveau message visible dans le fil ;
5. apercu de la conversation mis a jour ;
6. actualisation de la page ;
7. message toujours visible depuis l'historique REST.

## Incident exterieur au chat

Au premier demarrage, le backend a tente de lire Vault avant la fin de `vault-seeder`. Le backend depend de `vault-bootstrap`, mais pas directement de la fin du seeder. Un redemarrage du backend apres le seeding a suffi.

Ce probleme d'ordre de demarrage existant n'a pas ete modifie, conformement au perimetre demande. Il peut rendre le tout premier lancement variable selon la vitesse de la machine, mais il ne vient pas du chat.

## Conclusion

La V1 du chat fonctionne de bout en bout : authentification, autorisations, temps reel, validations, proxy WAF/Nginx, interface et persistance PostgreSQL.
