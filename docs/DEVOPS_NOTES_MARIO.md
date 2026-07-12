# DevOps Notes — Mario

---

## Cas #1 — WAF (ModSecurity) bloque Grafana : faux positif outbound

**Date :** 2026-07-01

### Symptôme
- `https://localhost:8443/grafana/login` → chargement infini / logo visible mais page jamais chargée
- Dashboard Grafana inaccessible, métriques non affichées
- Logs WAF : `ModSecurity: Access denied with code 403 (phase 4). Outbound Anomaly Score Exceeded (Total Score: 4)` sur `/grafana/login`
- HTTP status final : 500 (header déjà envoyé au browser quand ModSecurity décide de bloquer)

### Cause
ModSecurity analyse les réponses **sortantes** (phase 4) en plus des requêtes entrantes.
Le HTML de Grafana contient du JavaScript inline et des patterns que l'OWASP CRS identifie comme suspects (score XSS/injection).
Le score outbound atteignait 4, seuil `WAF_ANOMALY_OUTBOUND=4` → bloqué.

### Diagnostic
```bash
docker compose logs waf | grep "ModSecurity\|phase 4\|Outbound"
```

### Fix
Ajout d'une règle custom dans `waf/conf/custom-rules.conf` pour désactiver la règle 959100 (outbound anomaly scoring) uniquement sur `/grafana/` :

```nginx
SecRule REQUEST_URI "@beginsWith /grafana/" \
    "id:100017,phase:1,pass,nolog,ctl:ruleRemoveById=959100"
```

Le fichier doit être copié dans `rules/` (pas à la racine `owasp-crs/`) pour être inclus :
```dockerfile
COPY conf/custom-rules.conf /etc/modsecurity.d/owasp-crs/rules/custom-rules.conf
```

Puis rebuild :
```bash
docker compose up -d --build waf
```

### Leçon
- ModSecurity phase 4 = analyse des **réponses** sortantes, pas seulement des requêtes
- Les apps React/SPA (Grafana, etc.) génèrent des faux positifs outbound courants
- `ctl:ruleRemoveById` en phase 1 supprime la règle pour toute la transaction (toutes phases)
- Toujours vérifier `docker compose logs waf` en premier quand une page charge à l'infini derrière un WAF

---
