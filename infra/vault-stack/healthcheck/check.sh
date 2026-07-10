#!/bin/sh
VAULT_ADDR="https://vault:8200"

while true; do  # ← manquait
  HTTP_CODE=$(curl -sk -o /tmp/vault_health -w "%{http_code}" "$VAULT_ADDR/v1/sys/health" 2>/dev/null)

  if [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "000" ]; then
    echo "⚠ Vault unreachable"
    sleep 10
    continue
  fi

  STATUS=$(cat /tmp/vault_health)
  INIT=$(echo "$STATUS" | jq -r '.initialized')
  SEALED=$(echo "$STATUS" | jq -r '.sealed')

  if [ "$INIT" = "false" ]; then
    echo "⚠ Vault not initialized"
  elif [ "$SEALED" = "true" ]; then
    echo "⚠ Vault is SEALED"
  else
    echo "✓ Vault healthy - $(date)"
	sleep 110
  fi

  sleep 10
done
