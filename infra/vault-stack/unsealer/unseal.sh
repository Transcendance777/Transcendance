#!/bin/sh
set -eu

VAULT_ADDR="https://vault:8200"
KEYS_FILE="/vault_keys/keys.json"
ROOT_KEYS_FILE="/vault_keys/root_keys.json"

wait_vault() {
  until curl -sk -o /dev/null "$VAULT_ADDR/v1/sys/health" 2>/dev/null; do
    echo "Waiting for Vault..."
    sleep 2
  done
}

init_vault() {
	echo "Initializing Vault..."
	RESPONSE=$(curl -skf \
		--request POST \
		--data '{"secret_shares":5,"secret_threshold":3}' \
		"$VAULT_ADDR/v1/sys/init")
	echo "$RESPONSE" | jq '{keys: .keys}' > "$KEYS_FILE"
	echo "$RESPONSE" | jq '{root_token: .root_token}' > "$ROOT_KEYS_FILE"
	echo "✓ Keys saved"
}

unseal_vault() {
  echo "Unsealing Vault..."
  for i in 0 1 2; do
    KEY=$(jq -r ".keys[$i]" "$KEYS_FILE")
    echo "Applying unseal key $((i+1))/3..."
    RESPONSE=$(curl -skf -X POST \
      -d "{\"key\":\"$KEY\"}" \
      "$VAULT_ADDR/v1/sys/unseal")
    SEALED=$(echo "$RESPONSE" | jq -r '.sealed')
    if [ "$SEALED" = "false" ]; then
      echo "✓ Vault unsealed successfully"
      return 0
    fi
  done
  echo "❌ Vault still sealed after 3 keys"
  exit 1
}

wait_vault

INIT_STATUS=$(curl -sk "$VAULT_ADDR/v1/sys/init" | jq -r '.initialized')

if [ "$INIT_STATUS" = "false" ]; then
  init_vault
elif [ ! -f "$KEYS_FILE" ]; then
  echo "❌ Vault initialized but keys.json missing"
  exit 1
fi

SEALED=$(curl -sk "$VAULT_ADDR/v1/sys/health" | jq -r '.sealed')
if [ "$SEALED" = "false" ]; then
  echo "✓ Vault already unsealed"
  exit 0
fi

unseal_vault
