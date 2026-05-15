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