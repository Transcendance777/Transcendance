#!/bin/sh
# Usage: ./init-volumes.sh
# Démarre la stack, corrige les permissions des volumes Vault,
# puis redémarre vault proprement. Fonctionne même après un
# `podman-compose down -v` (volumes recréés vides par compose).
set -eu

PREFIX=$(basename "$(pwd)")

echo "→ Démarrage de la stack..."
podman-compose up -d

echo "→ Chown des volumes vers UID 100 (vault)..."
podman unshare chown -R 100:100 \
  "$(podman volume inspect "${PREFIX}_vault_data" --format '{{.Mountpoint}}')" \
  "$(podman volume inspect "${PREFIX}_vault_logs" --format '{{.Mountpoint}}')" \
  "$(podman volume inspect "${PREFIX}_vault_file" --format '{{.Mountpoint}}')"

echo "→ Redémarrage de vault pour appliquer les permissions..."
podman-compose restart vault

echo "✓ Stack prête (préfixe: ${PREFIX})."