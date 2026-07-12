#!/bin/sh
set -eu

VAULT_ADDR="https://vault:8200"
KEYS_FILE="/vault_keys/keys.json"
OUT_DIR="/approle_id"
ROLES="backend-api backend-dev devops"

vault_cmd() {
	curl -sk -H "X-Vault-Token: $1" "$2" "${@:3}"
}

generate_root_token() {
	echo "==> Generating temporary root token from unseal keys..." >&2

	ATTEMPT=$(curl -sk -X POST -d '{}' "$VAULT_ADDR/v1/sys/generate-root/attempt")
	NONCE=$(echo "$ATTEMPT" | jq -r '.nonce')
	OTP=$(echo "$ATTEMPT" | jq -r '.otp')
	COMPLETE="false"

	if [ -z "$NONCE" ] || [ "$NONCE" = "null" ]; then
		echo "❌ Failed to start generate-root: $ATTEMPT" >&2
		exit 1
	fi

	for i in 0 1 2; do
		KEY=$(jq -r ".keys[$i]" "$KEYS_FILE")
		UPDATE=$(curl -sk -X POST \
			-d "{\"key\":\"$KEY\",\"nonce\":\"$NONCE\"}" \
			"$VAULT_ADDR/v1/sys/generate-root/update")
		COMPLETE=$(echo "$UPDATE" | jq -r '.complete')
		PROGRESS=$(echo "$UPDATE" | jq -r '.progress')
		echo "    unseal key $((i + 1))/3 — progress ${PROGRESS}" >&2
		if [ "$COMPLETE" = "true" ]; then
			break
		fi
	done

	if [ "$COMPLETE" != "true" ]; then
		echo "❌ Generate-root did not complete" >&2
		exit 1
	fi

	ENCODED=$(curl -sk -X POST \
		-d "{\"otp\":\"$OTP\",\"nonce\":\"$NONCE\"}" \
		"$VAULT_ADDR/v1/sys/generate-root/encode")
	ENCODED_TOKEN=$(echo "$ENCODED" | jq -r '.encoded_root_token')

	if [ -z "$ENCODED_TOKEN" ] || [ "$ENCODED_TOKEN" = "null" ]; then
		echo "❌ Failed to encode root token: $ENCODED" >&2
		exit 1
	fi

	DECODED=$(curl -sk -X POST \
		-d "{\"otp\":\"$OTP\",\"encoded_root_token\":\"$ENCODED_TOKEN\"}" \
		"$VAULT_ADDR/v1/sys/generate-root/decode")
	ROOT_TOKEN=$(echo "$DECODED" | jq -r '.token')

	if [ -z "$ROOT_TOKEN" ] || [ "$ROOT_TOKEN" = "null" ]; then
		echo "❌ Failed to decode temporary root token" >&2
		exit 1
	fi

	printf '%s' "$ROOT_TOKEN"
}

refresh_approle_credentials() {
	ROOT_TOKEN="$1"

	echo "==> Refreshing AppRole credentials..."
	mkdir -p "$OUT_DIR"
	chmod 711 "$OUT_DIR"

	for NAME in $ROLES; do
		ROLE_ID=$(vault_cmd "$ROOT_TOKEN" "$VAULT_ADDR/v1/auth/approle/role/$NAME/role-id" | jq -r '.data.role_id')
		SECRET_ID=$(curl -sk -X POST \
			-H "X-Vault-Token: $ROOT_TOKEN" \
			"$VAULT_ADDR/v1/auth/approle/role/$NAME/secret-id" | jq -r '.data.secret_id')

		OUT_FILE="$OUT_DIR/${NAME}.json"
		jq -n --arg role_id "$ROLE_ID" --arg secret_id "$SECRET_ID" \
			'{role_id: $role_id, secret_id: $secret_id}' > "$OUT_FILE"
		chmod 644 "$OUT_FILE"
		echo "    ✓ AppRole $NAME credentials refreshed"
	done
}

ROOT_TOKEN=$(generate_root_token)
refresh_approle_credentials "$ROOT_TOKEN"

echo "==> Revoking temporary root token..."
curl -sk -X POST -H "X-Vault-Token: $ROOT_TOKEN" "$VAULT_ADDR/v1/auth/token/revoke-self" > /dev/null || true

echo "✅ AppRole credentials refreshed"
