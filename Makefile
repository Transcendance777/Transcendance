COMPOSE = docker compose -f $(COMPOSE_FILE) -f $(COMPOSE_OVERRIDE) --env-file $(ENV_FILE)
COMPOSE_FILE = infra/docker-compose.yaml
COMPOSE_OVERRIDE = infra/docker-compose.override.yaml
ENV_FILE = .env

all: up

up: $(ENV_FILE) certs vault-keys
	$(COMPOSE) up -d

certs:
	@if [ ! -f infra/waf/certs/cert.crt ] || [ ! -f infra/vault-stack/vault/certs/vault.crt ]; then \
		bash infra/scripts/generate_certs.sh; \
	fi

# root_keys.json doit exister comme vrai fichier AVANT le compose up, sinon
# Docker le crée comme dossier vide au moment ou il materialise le bind-mount
# de vault-bootstrap (mount fichier precis, pour ne pas exposer keys.json)
vault-keys:
	@mkdir -p infra/vault-stack/vault_keys infra/vault-stack/approle_id
	@touch infra/vault-stack/vault_keys/root_keys.json

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
	docker run --rm -v $(PWD)/infra/vault-stack/vault_keys:/k -v $(PWD)/infra/vault-stack/approle_id:/a alpine sh -c "rm -rf /k/* /a/*"
	rm -f infra/waf/certs/*.crt infra/waf/certs/*.key infra/nginx/certs/*.crt infra/nginx/certs/*.key infra/vault-stack/vault/certs/*.crt infra/vault-stack/vault/certs/*.key

# Garde fou
$(ENV_FILE):
	@echo "Erreur : fichier .env manquant. Copie .env.example vers .env."
	@exit 1

.PHONY: all up re rebuild logs ps clean fclean vault-keys
