#!/bin/bash

set -e
# Dossier de stockage certificats
CERT_DIR="$(dirname "$0")/../waf/certs"
VAULT_CERT_DIR="$(dirname "$0")/../vault-stack/vault/certs"

mkdir -p $CERT_DIR
mkdir -p $VAULT_CERT_DIR

# Générer le certificat sans poser de questions (grâce à -subj)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.key" \
  -out "$CERT_DIR/cert.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=localhost"

chmod 600 "$CERT_DIR/key.key" "$CERT_DIR/cert.crt"

# Cert dédié vault (clé propre, ne pas réutiliser celle du WAF : domaines de confiance distincts)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$VAULT_CERT_DIR/vault.key" \
  -out "$VAULT_CERT_DIR/vault.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=vault"

chmod 644 "$VAULT_CERT_DIR/vault.key" "$VAULT_CERT_DIR/vault.crt"

echo "Certificats SSL générés avec succès dans $CERT_DIR et $VAULT_CERT_DIR !"
