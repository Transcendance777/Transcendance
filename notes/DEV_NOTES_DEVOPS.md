# DEV NOTES – DevOps

## Monitoring

**Stack imposée par le sujet :** Prometheus + Grafana + ELK

**Principe :** collecter régulièrement des métriques (utilisation CPU, mémoire, latence, requêtes HTTP, etc.) afin de garder un historique, visualiser les tendances et déclencher des alertes pour détecter les problèmes.

### Composants

- **Prometheus** — collecte et stockage des métriques (image officielle)
- **Node Exporter** — récupère les métriques kernel/système et les expose à Prometheus

