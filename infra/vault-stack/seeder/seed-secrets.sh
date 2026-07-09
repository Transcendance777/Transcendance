#!/bin/sh
set -eu

VAULT_ADDR="http://vault:8200"

: "${CYBER_PASSWORD:?}" "${DB_PASS:?}" "${JWT_SECRET:?}" "${GOOGLE_CLIENT_SECRET:?}" "${TWITCH_CLIENT_SECRET:?}"

echo "==> Logging in as cyber..."
VAULT_TOKEN=$(curl -sf -X POST \
  -d "{\"password\":\"$CYBER_PASSWORD\"}" \
  "$VAULT_ADDR/v1/auth/userpass/login/cyber" | jq -r '.auth.client_token')

echo "==> Writing secrets to secret/prod/backend..."
curl -sf -X POST \
  -H "X-Vault-Token: $VAULT_TOKEN" \
  -d "{\"data\":{\"DB_PASS\":\"$DB_PASS\",\"JWT_SECRET\":\"$JWT_SECRET\",\"GOOGLE_CLIENT_SECRET\":\"$GOOGLE_CLIENT_SECRET\",\"TWITCH_CLIENT_SECRET\":\"$TWITCH_CLIENT_SECRET\"}}" \
  "$VAULT_ADDR/v1/secret/data/prod/backend"

echo "    ✓ Secrets écrits dans secret/prod/backend"
