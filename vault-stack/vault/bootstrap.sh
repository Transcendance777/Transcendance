#!/bin/sh
set -eu

VAULT_ADDR="http://vault:8200"
POLICIES_DIR="/vault/policies"

# ── Helpers ────────────────────────────────────────────────────────────────────

vault_cmd() {
  curl -sf \
    -H "X-Vault-Token: $VAULT_TOKEN" \
    "$@"
}

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

  echo "    ✓ AppRole $NAME created"
  echo "      role_id   : $ROLE_ID"
  echo "      secret_id : $SECRET_ID"
}

create_approle "backend-prod" "backend-app-prod" "1h"  "4h"  "24h"
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

echo ""
echo "Bootstrap terminé"
