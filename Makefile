COMPOSE = docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)
COMPOSE_FILE = infra/docker-compose.yaml
ENV_FILE = .env

all: up

up: $(ENV_FILE) certs
	$(COMPOSE) up -d

certs:
	@if [ ! -f infra/waf/certs/cert.crt ] || [ ! -f infra/vault-stack/vault/certs/vault.crt ] \
		|| [ ! -f infra/nginx/certs/nginx.crt ] || [ ! -f infra/monitoring/prometheus/certs/prometheus.crt ] \
		|| [ ! -f infra/monitoring/grafana/certs/grafana.crt ] || [ ! -f infra/backend/certs/backend.crt ]; then \
		bash infra/scripts/generate_certs.sh; \
	fi

down:
	$(COMPOSE) down

re: down
	$(COMPOSE) up -d --build

# Rebuild + relance un seul service, ex: make rebuild SERVICE=waf
rebuild:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Usage: make rebuild SERVICE=<nom_service>"; \
		exit 1; \
	fi
	$(COMPOSE) build $(SERVICE)
	$(COMPOSE) up -d $(SERVICE)

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

# Attention, nettoyage des conteneurs et des volumes (efface la db)
clean:
	$(COMPOSE) down -v

# Nettoyage complet + images construites + réseaux orphelins + clés
fclean: clean
	$(COMPOSE) down --rmi all --remove-orphans
	docker system prune -f
	rm -rf infra/vault-stack/vault_keys/* infra/vault-stack/approle_id/*
	rm -f infra/waf/certs/*.crt infra/waf/certs/*.key infra/nginx/certs/*.crt infra/nginx/certs/*.key infra/vault-stack/vault/certs/*.crt infra/vault-stack/vault/certs/*.key
	rm -f infra/monitoring/prometheus/certs/*.crt infra/monitoring/prometheus/certs/*.key infra/monitoring/grafana/certs/*.crt infra/monitoring/grafana/certs/*.key infra/backend/certs/*.crt infra/backend/certs/*.key

# Garde fou
$(ENV_FILE):
	@echo "Erreur : fichier .env manquant. Copie .env.example vers .env."
	@exit 1

.PHONY: all up re rebuild logs ps clean fclean
