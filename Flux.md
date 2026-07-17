author : mdodevsk

Reverse proxy :

Situation 1
Un client fait une requete https://gamerev.com, waf intercepte la requête, l'analyse et vérifie
qu'elle n'est pas malveillante (SQLi, XSS...), si la requête est propre alors il ouvre une connexion
vers nginx et lui transmet la requête.
Nginx traite la requete, envoie la reponse à WAF et WAF repond au client
--> Ici le client n'est pas au courant que nginx existe, il communique uniquement avec WAF

Situation 2
Si WAF fait uniquement de la redirection alors, le client demande https://gamerev.com, WAF lui renvoie
code 301 "l'adresse à changé va ici https://nginx.backend.local" le client refait une requete à cette
adrresse
--> Ici le client est au courant que nginx existe


Dans la situation 1, la communication entre waf et nginx est facilité via le réseau docker,
----
networks:
  gamerev:
    driver: bridge
----
docker ajoute une couche d'abstraction au reseau, WAF n'a plus besoin de connaitre l'ip exacte du conteneur
qui change à chaque redemarrage, il lui suffit de connaitre le nom du conteneur ou du service et docker
traduit ce nom en IP via le DNS interne


Pourquoi le TLS se termine sur WAF ?

- Son role est de verifier les requetes donc il doit pouvoir les dechiffrer.
- Si le tls se termine sur nginx il peut pas lire les requetes et faire son travail

WAF (web application firewall) = NGINX + ModSecurity

Pour linstant voici a quoi ressemble le flux dans notre app
Client ──TLS(HTTPS)──> WAF ──???──> nginx ──???──> backend ──???──> vault

??? = HTTP pas securisé donc si un conteneur est compromis et que qlq peut
ecouter sur le reseau gamerev, il pourra voit tout en clair.
Il faut ajouter du TLS partout pour que meme si ca arrive ca soit illisible


Aparté : permissions UID entre host et conteneurs (bind mount)

Bug rencontré : vault crashait en boucle chez un dev Linux ("permission denied"
sur vault.crt) alors que ça marchait chez moi (Mac). Même code, même repo.

Ce qu'il faut retenir pour la suite :
- Un bind mount (-v host_path:container_path) n'ajoute AUCUNE couche de
  permission. C'est le même fichier, sur le même filesystem, vu depuis deux
  chemins différents. Le kernel applique les mêmes checks UID/rwx que si on
  accédait au fichier direct depuis le host.
- root DANS le conteneur = root sur le host (UID 0 = UID 0), sauf si
  userns-remap est activé côté daemon Docker (rare en config par défaut).
  root a CAP_DAC_OVERRIDE -> il bypass toutes les permissions fichier.
  Un conteneur qui tourne en root peut donc lire/supprimer des fichiers
  chmod 600 appartenant à n'importe quel user du host.
- À l'inverse, un conteneur qui tourne en user non-root (ex: l'image
  hashicorp/vault drop les privilèges vers un user "vault" UID 100 avant
  de démarrer) est soumis aux permissions classiques. Si le fichier monté
  appartient à un autre UID en chmod 600, ce process ne pourra pas le lire.
  point.
- Docker Desktop (Mac/Windows) fait tourner les conteneurs dans une VM avec
  une couche de traduction sur les bind mounts (virtiofs/osxfs) qui masque
  ce genre de problème -> ça "marche chez moi" alors que ça casse sur un
  Linux natif, qui applique les vraies permissions POSIX sans filet.

Règle à appliquer systématiquement : ne jamais tester la portabilité
d'un projet Docker uniquement sur Mac. Les bugs de permissions liés aux
UID/GID entre host et conteneur sont invisibles sur Mac et systématiques
sur Linux (prod = Linux dans 99% des cas).

Fix appliqué ici : monter en volume pour laisser docker gérer ce cas,
sa couche d'abstraction suffit pour régler le soucis
