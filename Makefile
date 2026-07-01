COMPOSE = docker compose
COMPOSE_FILE = docker-compose.yaml
ENV_FILE = .env

all: up

up: $(ENV_FILE) certs
	$(COMPOSE) -f $(COMPOSE_FILE) up -d

certs:
	@if [ ! -f waf/certs/cert.crt ]; then \
		bash scripts/generate_certs.sh; \
	fi

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down

re: down
	$(COMPOSE) -f $(COMPOSE_FILE) up -d --build

logs:
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f

ps:
	$(COMPOSE) -f $(COMPOSE_FILE) ps

# Attention, nettoyage des conteneurs et des volumes (efface la db)
clean:
	$(COMPOSE) -f $(COMPOSE_FILE) down -v

# Nettoyage complet + images construites + réseaux orphelins
fclean: clean
	$(COMPOSE) -f $(COMPOSE_FILE) down --rmi all --remove-orphans
	docker system prune -f

# Garde fou
$(ENV_FILE):
	@echo "Erreur : fichier .env manquant. Copie .env.example vers .env."
	@exit 1

.PHONY: all up re logs ps clean fclean
