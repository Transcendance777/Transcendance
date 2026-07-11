# Chat - Schema simple des relations DB

Objectif : comprendre simplement comment stocker un chat entre utilisateurs dans une base de donnees relationnelle comme PostgreSQL, avec Prisma comme outil cote backend.

## Idee principale

On ne cree pas une table par utilisateur.

Mauvaise idee :

```text
messages_user_1
messages_user_2
messages_user_3
...
```

Pourquoi c'est mauvais :

- impossible a maintenir quand le nombre d'utilisateurs augmente ;
- difficile de chercher une conversation entre deux personnes ;
- difficile de faire des permissions propres ;
- difficile de faire evoluer la base ;
- pas coherent avec le reste du projet.

Bonne idee :

```text
users
conversations
conversation_participants
chat_messages
```

On garde des tables communes, et on utilise des IDs pour dire :

- qui participe a quelle conversation ;
- qui a envoye quel message ;
- dans quelle conversation le message se trouve.

## Les 3 tables du chat

Pour une v1 propre, il faut surtout 3 tables.

```text
Conversation
ConversationParticipant
ChatMessage
```

Le projet a deja une table utilisateurs :

```text
Users
```

Donc on ne recree pas les users. On relie le chat aux users existants.

## 1. Users

Cette table existe deja dans le projet.

Elle represente les comptes utilisateurs.

Exemple :

```text
users
---------
id | username
3  | Alice
8  | Bob
```

Pour le chat, on utilise surtout `id`.

Exemple :

```text
senderId = 3
```

veut dire :

```text
le message a ete envoye par Alice
```

## 2. Conversation

Une conversation represente un fil de discussion.

Elle ne contient pas directement les messages dans une colonne. Elle sert de point central.

Exemple :

```text
conversations
-------------------------------
id | type   | directKey | createdAt
42 | direct | 3:8       | ...
```

Signification :

```text
La conversation 42 est une conversation directe entre les users 3 et 8.
```

### Pourquoi `directKey` ?

`directKey` evite de creer deux conversations pour les memes personnes.

Exemple :

```text
Alice id = 3
Bob id = 8
```

On calcule toujours la cle avec le plus petit ID en premier :

```text
3:8
```

Donc :

- si Alice demarre le chat avec Bob, directKey = `3:8` ;
- si Bob demarre le chat avec Alice, directKey = `3:8` aussi.

Resultat :

```text
une seule conversation entre Alice et Bob
```

## 3. ConversationParticipant

C'est la table de jointure.

Une table de jointure sert a relier deux tables entre elles.

Ici, elle relie :

```text
Users <-> Conversations
```

Pourquoi il faut une jointure ?

Parce que :

- un utilisateur peut etre dans plusieurs conversations ;
- une conversation contient plusieurs utilisateurs.

C'est une relation many-to-many.

Exemple :

```text
conversation_participants
-----------------------------
conversationId | userId
42             | 3
42             | 8
```

Signification :

```text
La conversation 42 contient Alice.
La conversation 42 contient Bob.
```

Schema mental :

```text
Conversation 42
├── User 3: Alice
└── User 8: Bob
```

### Pourquoi ne pas mettre directement `user1Id` et `user2Id` dans Conversation ?

Pour un chat 1-to-1, on pourrait faire :

```text
conversation
----------------
id | user1Id | user2Id
42 | 3       | 8
```

Mais la table de jointure est plus propre parce que :

- elle ressemble au reste des relations many-to-many du projet ;
- elle permet de rajouter plus tard des conversations de groupe ;
- elle permet de stocker des infos par participant.

Exemples d'infos par participant :

```text
joinedAt
lastReadAt
muted
archived
```

Pour la v1, `lastReadAt` est deja utile pour savoir quels messages sont non lus.

## 4. ChatMessage

Cette table stocke les vrais messages.

Exemple :

```text
chat_messages
------------------------------------------------
id  | conversationId | senderId | body    | createdAt
100 | 42             | 3        | salut   | ...
101 | 42             | 8        | yo      | ...
```

Signification :

```text
Le message 100 est dans la conversation 42.
Il a ete envoye par le user 3, donc Alice.
Son contenu est "salut".
```

Puis :

```text
Le message 101 est dans la conversation 42.
Il a ete envoye par le user 8, donc Bob.
Son contenu est "yo".
```

## Schema global simple

```text
Users
  |
  | userId
  v
ConversationParticipant
  ^
  | conversationId
  |
Conversation
  |
  | conversationId
  v
ChatMessage
```

Version plus lisible :

```text
Users -----< ConversationParticipant >----- Conversations -----< ChatMessages
```

Lecture :

- un user peut avoir plusieurs lignes dans `ConversationParticipant` ;
- une conversation peut avoir plusieurs participants ;
- une conversation peut avoir plusieurs messages ;
- chaque message a un seul sender.

## Exemple complet

### Etape 1 : deux utilisateurs existent

```text
users
---------
id | username
3  | Alice
8  | Bob
```

### Etape 2 : on cree une conversation

```text
conversations
-------------------------------
id | type   | directKey
42 | direct | 3:8
```

### Etape 3 : on ajoute les participants

```text
conversation_participants
-----------------------------
conversationId | userId
42             | 3
42             | 8
```

### Etape 4 : Alice envoie un message

```text
chat_messages
------------------------------------------------
id  | conversationId | senderId | body
100 | 42             | 3        | Salut Bob
```

### Etape 5 : Bob repond

```text
chat_messages
------------------------------------------------
id  | conversationId | senderId | body
100 | 42             | 3        | Salut Bob
101 | 42             | 8        | Yo Alice
```

## Comment recuperer une conversation ?

Pour afficher la conversation entre Alice et Bob :

1. On calcule la cle directe :

```text
3:8
```

2. On cherche la conversation :

```text
Conversation where directKey = "3:8"
```

3. On recupere les messages :

```text
ChatMessage where conversationId = 42
```

4. On joint avec `Users` pour afficher le username/avatar de l'expediteur.

Resultat affiche cote front :

```text
Alice: Salut Bob
Bob: Yo Alice
```

## Comment verifier les droits ?

Avant de laisser quelqu'un lire ou envoyer dans une conversation, on verifie qu'il est participant.

Exemple :

```text
user connecte = 3
conversation demandee = 42
```

On cherche :

```text
conversation_participants
where conversationId = 42
and userId = 3
```

Si la ligne existe :

```text
OK, Alice peut lire/envoyer dans cette conversation.
```

Si elle n'existe pas :

```text
Refus 403, elle n'a pas acces.
```

## A quoi servent les websockets dans ce schema ?

La base de donnees stocke la verite.

```text
PostgreSQL = source de verite
```

Quand Alice envoie un message :

1. Le backend verifie qu'Alice est dans la conversation.
2. Le backend sauvegarde le message dans `chat_messages`.
3. Le backend utilise websocket pour prevenir Bob en direct.

Donc websocket ne remplace pas la DB.

Websocket sert seulement a dire :

```text
Nouveau message, affiche-le maintenant.
```

## Schema avec websocket

```text
Alice front
   |
   | message:send
   v
Backend
   |
   | INSERT INTO chat_messages
   v
PostgreSQL
   |
   | message:new
   v
Bob front
```

Le message est stocke en DB, puis pousse en temps reel a Bob.

## Schema Prisma simplifie

Ce n'est pas encore du code a appliquer, juste une idee de structure.

```prisma
model Conversation {
  id        Int      @id @default(autoincrement())
  type      String   @default("direct")
  directKey String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  participants ConversationParticipant[]
  messages     ChatMessage[]
}

model ConversationParticipant {
  conversationId Int
  userId         Int
  joinedAt       DateTime  @default(now())
  lastReadAt     DateTime?

  conversation Conversation @relation(fields: [conversationId], references: [id])
  user         Users        @relation(fields: [userId], references: [id])

  @@id([conversationId, userId])
}

model ChatMessage {
  id             Int      @id @default(autoincrement())
  conversationId Int
  senderId       Int
  body           String
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
  sender       Users        @relation(fields: [senderId], references: [id])
}
```

## Resume ultra court

On stocke :

```text
Conversation = le fil de discussion
ConversationParticipant = qui est dans le fil
ChatMessage = les messages du fil
```

On utilise une table de jointure parce que :

```text
un user peut avoir plusieurs conversations
une conversation a plusieurs users
```

On ne fait pas une table par user.

On garde :

```text
DB = stockage durable
REST = charger l'historique
Websocket = recevoir le nouveau message instantanement
```

