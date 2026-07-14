#!/bin/sh
set -eu

VAULT_ADDR="https://vault:8200"
POLICIES_DIR="/vault/policies"
OUT_DIR="/approle_id"

echo "==> Waiting for vault-unsealer..."
until [ -f /vault_keys/root_keys.json ]; do
  sleep 2
done

VAULT_TOKEN=$(jq -r .root_token /vault_keys/root_keys.json)

# ── Helpers ────────────────────────────────────────────────────────────────────

vault_cmd() {
  curl -skf \
    -H "X-Vault-Token: $VAULT_TOKEN" \
    "$@"
}

if ! vault_cmd "$VAULT_ADDR/v1/auth/token/lookup-self" > /dev/null 2>&1; then
  echo "Root token invalide ou déjà révoqué — bootstrap déjà effectué précédemment, rien à refaire."
  exit 0
fi

already_enabled() {
  PATH_CHECK="$1"
  vault_cmd "$VAULT_ADDR/v1/sys/mounts" | jq -e ".[\"$PATH_CHECK/\"]" > /dev/null 2>&1
}

already_enabled_auth() {
  PATH_CHECK="$1"
  vault_cmd "$VAULT_ADDR/v1/sys/auth" | jq -e ".[\"$PATH_CHECK/\"]" > /dev/null 2>&1
}

# ── Secrets Engine KV v2 ───────────────────────────────────────────────────────

echo "==> Enabling KV v2..."
if already_enabled "secret"; then
  echo "    ✓ KV v2 already enabled"
else
  vault_cmd -X POST \
    -d '{"type":"kv","options":{"version":"2"}}' \
    "$VAULT_ADDR/v1/sys/mounts/secret"
  echo "    ✓ KV v2 enabled"
fi

# ── Auth Methods ───────────────────────────────────────────────────────────────

echo "==> Enabling AppRole..."
if already_enabled_auth "approle"; then
  echo "    ✓ AppRole already enabled"
else
  vault_cmd -X POST \
    -d '{"type":"approle"}' \
    "$VAULT_ADDR/v1/sys/auth/approle"
  echo "    ✓ AppRole enabled"
fi

echo "==> Enabling Userpass..."
if already_enabled_auth "userpass"; then
  echo "    ✓ Userpass already enabled"
else
  vault_cmd -X POST \
    -d '{"type":"userpass"}' \
    "$VAULT_ADDR/v1/sys/auth/userpass"
  echo "    ✓ Userpass enabled"
fi

# ── Policies ───────────────────────────────────────────────────────────────────

echo "==> Writing policies..."
for POLICY_FILE in "$POLICIES_DIR"/*.hcl; do
  POLICY_NAME=$(basename "$POLICY_FILE" .hcl)
  POLICY_CONTENT=$(cat "$POLICY_FILE")
  vault_cmd -X PUT \
    -d "{\"policy\":$(echo "$POLICY_CONTENT" | jq -Rs .)}" \
    "$VAULT_ADDR/v1/sys/policies/acl/$POLICY_NAME"
  echo "    ✓ Policy $POLICY_NAME applied"
done

# ── AppRoles ───────────────────────────────────────────────────────────────────

echo "==> Creating AppRoles..."
mkdir -p "$OUT_DIR"
chmod 711 "$OUT_DIR"

create_approle() {
  NAME="$1"
  POLICY="$2"
  TTL="$3"
  MAX_TTL="$4"
  SECRET_TTL="$5"

  vault_cmd -X POST \
    -d "{\"token_policies\":\"$POLICY\",\"token_ttl\":\"$TTL\",\"token_max_ttl\":\"$MAX_TTL\",\"secret_id_ttl\":\"$SECRET_TTL\"}" \
    "$VAULT_ADDR/v1/auth/approle/role/$NAME"

  ROLE_ID=$(vault_cmd "$VAULT_ADDR/v1/auth/approle/role/$NAME/role-id" | jq -r '.data.role_id')
  SECRET_ID=$(vault_cmd -X POST "$VAULT_ADDR/v1/auth/approle/role/$NAME/secret-id" | jq -r '.data.secret_id')

  OUT_FILE="$OUT_DIR/${NAME}.json"
  jq -n --arg role_id "$ROLE_ID" --arg secret_id "$SECRET_ID" \
    '{role_id: $role_id, secret_id: $secret_id}' > "$OUT_FILE"
  chmod 644 "$OUT_FILE"

  echo "    ✓ AppRole $NAME created (credentials écrites dans $OUT_FILE, non affichées)"
}

create_approle "backend-api" "backend-app-prod" "4h"  "5h"  "24h"
create_approle "backend-dev"  "backend-dev"      "8h"  "24h" "720h"
create_approle "devops"       "devops"           "8h"  "24h" "720h"

# ── Userpass ───────────────────────────────────────────────────────────────────

echo "==> Creating userpass for cyber admin..."
if [ -z "${CYBER_PASSWORD:-}" ]; then
  echo "CYBER_PASSWORD non défini (variable d'environnement requise)"
  exit 1
fi

vault_cmd -X POST \
  -d "{\"password\":\"$CYBER_PASSWORD\",\"token_policies\":\"devops\"}" \
  "$VAULT_ADDR/v1/auth/userpass/users/cyber"
echo "    ✓ User 'cyber' created with devops policy"

# ── Audit Log ──────────────────────────────────────────────────────────────────

echo "==> Enabling audit log..."
AUDIT_STATUS=$(vault_cmd "$VAULT_ADDR/v1/sys/audit" | jq 'keys | length')
if [ "$AUDIT_STATUS" -gt 0 ]; then
  echo "    ✓ Audit already enabled"
else
  vault_cmd -X PUT \
    -d '{"type":"file","options":{"file_path":"/vault/logs/audit.log"}}' \
    "$VAULT_ADDR/v1/sys/audit/file"
  echo "    ✓ Audit log enabled → /vault/logs/audit.log"
fi


# ── Révocation du root token ────────────────────────────────────────────────────
# Ne doit servir qu'au bootstrap. Plus aucune opération après ce point ne
# devrait nécessiter un accès root permanent.

echo "==> Revoking root token used for bootstrap..."
vault_cmd -X POST "$VAULT_ADDR/v1/auth/token/revoke-self" || true
unset VAULT_TOKEN
echo "    ✓ Root token revoked"

echo ""
echo "✅ Bootstrap terminé"
