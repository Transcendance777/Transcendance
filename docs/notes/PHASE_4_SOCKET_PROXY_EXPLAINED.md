# Phase 4 - Faire passer Socket.IO par le WAF et Nginx

Date : 2026-07-11  
Branche : `ufalzone`

## Objectif

Le serveur Socket.IO existe deja dans le backend sur le port `4000`. Cette phase rend son chemin `/socket.io/` accessible depuis l'entree HTTPS publique du projet.

```text
Navigateur
    |
    | HTTPS :8443
    v
WAF ModSecurity
    |
    | HTTP interne
    v
Nginx
    |
    | HTTP ou WebSocket :4000
    v
Backend Express + Socket.IO
```

Cette phase ne cree pas l'interface de chat. Elle construit uniquement le chemin reseau utilise par le futur frontend.

## Notion : reverse proxy

Un reverse proxy recoit une requete avant le vrai serveur et choisit ou l'envoyer.

Dans ce projet, Nginx fait deja ce travail :

```text
/api/       -> backend:4000
/           -> frontend:80
/grafana/   -> grafana:3000
```

La phase 4 ajoute :

```text
/socket.io/ -> backend:4000
```

REST et Socket.IO gardent donc deux chemins differents.

## Notion : Upgrade WebSocket

Une connexion WebSocket commence comme une requete HTTP. Le navigateur demande ensuite de conserver la connexion et de changer de protocole.

```text
Connection: Upgrade
Upgrade: websocket
```

Nginx doit retransmettre ces headers au backend. Sans eux, le backend Socket.IO existe mais la connexion WebSocket ne peut pas etre etablie.

Le fichier concerne est :

```text
infra/nginx/nginx.conf
```

La variable Nginx `connection_upgrade` vaut :

- `upgrade` lorsqu'un header `Upgrade` est present ;
- `close` pour une requete HTTP normale.

Les timeouts sont fixes a 75 secondes. Cette valeur laisse assez de temps au mecanisme ping/pong de Socket.IO et evite que Nginx ferme une connexion saine trop tot.

## Notion : WAF

WAF signifie Web Application Firewall.

Il inspecte les requetes HTTP avant qu'elles atteignent Nginx et cherche des comportements ressemblant a des attaques : SQL injection, XSS, inclusion de fichier ou commande systeme.

Le WAF n'est ni le serveur Socket.IO, ni la base de donnees. C'est une couche de controle placee devant eux.

```text
requete normale   -> autorisee
requete suspecte  -> bloquee
```

L'image officielle `owasp/modsecurity-crs:nginx` transmet deja `Upgrade`, `Connection` et utilise HTTP/1.1 dans son template `proxy_backend.conf.template`. Il n'est donc pas necessaire de remplacer sa configuration Nginx interne. Notre travail WAF se limite a l'exclusion CRS ciblee.

## Pourquoi une exclusion WAF est necessaire

Socket.IO essaie WebSocket, mais peut utiliser temporairement le fallback Engine.IO `polling`.

Ce fallback envoie des requetes POST avec :

```text
Content-Type: text/plain;charset=UTF-8
```

La regle CRS `920420` refuse par defaut certains types de contenu que ModSecurity ne sait pas analyser normalement. Cela peut bloquer le polling Socket.IO avant meme que notre authentification JWT soit executee.

La solution retenue retire uniquement la regle `920420` lorsque les trois conditions suivantes sont reunies :

```text
chemin       = /socket.io/
methode      = POST
Content-Type = text/plain
```

Une requete sur un autre chemin, une autre methode ou un autre type de contenu ne profite pas de cette exclusion. Les protections portant sur les headers, l'URL et les autres requetes restent actives.

## Pourquoi ne pas modifier directement les protections generales

Les solutions suivantes sont volontairement refusees :

```text
SecRuleEngine Off
ctl:ruleEngine=DetectionOnly
ctl:requestBodyAccess=Off
suppression globale de toutes les regles CRS
```

Elles laisseraient passer beaucoup plus que Socket.IO. Une exception de securite doit etre limitee au chemin et a la regle responsables du faux positif.

## Placement du fichier d'exclusion

Fichier source du projet :

```text
infra/waf/conf/socket-exclusions.conf
```

Destination dans l'image WAF :

```text
/etc/modsecurity.d/owasp-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf
```

Le prefixe `REQUEST-900` est important : cette exclusion doit etre chargee avant les regles CRS qu'elle ajuste.

Le fichier `custom-rules.conf` reste en place pour les protections generales deja ecrites par l'equipe. Notre exception Socket.IO reste separee et identifiable.

## Fichiers modifies

```text
infra/nginx/nginx.conf
infra/waf/Dockerfile
infra/waf/conf/socket-exclusions.conf
```

## Verification attendue

### 1. Configuration

- l'image WAF doit inclure le fichier d'exclusion ;
- Nginx doit accepter sa configuration ;
- `/api/` et `/` doivent conserver leurs destinations.

### 2. Handshake Engine.IO

La requete suivante doit atteindre Socket.IO via HTTPS :

```text
GET https://localhost:8443/socket.io/?EIO=4&transport=polling
```

Une reponse Engine.IO commence normalement par un paquet d'ouverture contenant un `sid`.

### 3. Authentification Socket.IO

- sans JWT : connexion Socket.IO refusee ;
- JWT invalide : connexion refusee ;
- JWT valide : connexion acceptee et room `user:{id}` rejointe.

### 4. Regression minimale

- `/api/` continue de pointer vers le backend ;
- `/` continue de pointer vers le frontend ;
- les regles WAF restent actives hors `/socket.io/`.

## Limite de cette phase

La configuration reseau est en place, mais le test fonctionnel complet avec Alice et Bob sera realise apres creation du frontend chat. Cette phase ne modifie aucun composant React.

## Sources techniques

- Socket.IO, reverse proxy : `https://socket.io/docs/v4/reverse-proxy/` ;
- OWASP CRS, faux positifs et exclusions : `https://coreruleset.org/docs/2-how-crs-works/2-3-false-positives-and-tuning/` ;
- image Docker OWASP CRS : `https://github.com/coreruleset/modsecurity-crs-docker` ;
- template proxy de l'image WAF : `https://raw.githubusercontent.com/coreruleset/modsecurity-crs-docker/main/nginx/templates/includes/proxy_backend.conf.template` ;
- code local `engine.io-client` : utilisation de `text/plain;charset=UTF-8` pour le polling.
