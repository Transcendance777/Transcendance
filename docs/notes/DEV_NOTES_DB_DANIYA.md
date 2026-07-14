# Base de données - Notes

## Définitions

**Database** : système organisé pour stocker, gérer et récuperer des informations
→ infos sont écrites sur le dique dur

**DB relationnelle** (SQL) : structure rigide de tables avec clés (mySQL, PostgreSQL)

**DB non-relationnelle** (NoSQL) : données stockées dans des documents + flexibles (.JSON) (MongoDB)

**Table** : structure de données avec des **colonnes** (type) et **lignes** (entrée)
ex : **Table `Users`** : colonnes `id`, `email`, `password_hash`

**Clé** : identifiant d’une colonne dans une table 

**Admin ≠ other user** : l’admin peut supp, modifier toutes les DB alors qu’un utilisateur classique ne peut que modifier la DB a laquelle il a droit

**Manipulation données** : les données sont dans un endroit spécifique de l’ordinateur (ex: var/lib/postgresql/data) et le programme ne touche pas à ces données directement : il fait des requetes SQL au serveur postgres et il lui renvoi les données/les modifies etc

## Fonctionnement

### Comment fonctionne la persistence des données ?

**Sur une même machine**

À chaque redémarrage des conteneurs, voila ce qu'il se passe avec les données:
- un volume est monté à un endroit de ton choix, comme `/database_data` : c'est la que nos données sont stockées sur la **machine**
- ce volume est relié à un dossier `/var/lib/postgresql/data` **dans le conteneur**, et les données pourront alors être partagées entre machine et conteneur
- si c'est la première fois que l'application est lancée, le volume est vide, alors : 
    - l'ORM Prisma crée le schéma de données (tables: users, games, etc)
    - les données de bases sont implémentées avec un script (seeding) pour que l'application ait toujours des données par défaut avec lesquelles fonctionner
- maintenant, à chaque fois que des données vont être modifiée (ex: nouvel utilisateur crée), elles le seront dans le dossier data du conteneur ET dans le volume
- si les conteneurs sont redémarrés, les données sur le volume n'ont pas bougées, l'application va alors les récuperer, et voilà, nos données ont persisté !

**D'une machine à une autre**

Et maintenant si je décide de git clone l'application depuis une autre machine, comment je récupère toutes ces données ?
En récupérant le projet via Git, tu ne peux pas récupérer 2 choses :
- le .env -> c'est un dossier confidentiel, il faudra le recréer/récuperer manuellement
- les données existantes uniquement sur le volume : si des données ont été crées en dehors du code backend et du scripting, elles sont alors uniquement stockées **sur la machine où tu les a créeés**, tu ne peux alors pas récuperer ces données

Donc, à chaque fois que tu récupère l'application sur une autre machine, tu auras seulement :
- les schémas crées par l'ORM
- les données de bases crées par le script de seeding
Le reste est effacé en passant de machine en machine.

intermédiaire (`review_likes`) qui contient juste les paires (user, review)

**Relation réflexive** : une table qui se relie à elle-même. Ici `friendships` lie des utilisateurs à d'autres utilisateurs. C'est toujours un Many-to-Many "sur soi-même"

**Références** (base de données) : c’est simplement une valeur copiée, de l’ID de l’autre valeur dans sa table à elle

## Schéma des données
<img width="1920" height="1080" alt="users" src="https://github.com/user-attachments/assets/962d1587-c996-4934-b5ee-ad5871a803f0" />
