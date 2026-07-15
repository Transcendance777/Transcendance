#!/bin/bash

set -e
# Dossier de stockage certificats
CERT_DIR="$(dirname "$0")/../waf/certs"
VAULT_CERT_DIR="$(dirname "$0")/../vault-stack/vault/certs"
NGINX_CERT_DIR="$(dirname "$0")/../nginx/certs"
PROM_CERT_DIR="$(dirname "$0")/../monitoring/prometheus/certs"
GRAFANA_CERT_DIR="$(dirname "$0")/../monitoring/grafana/certs"
BACKEND_CERT_DIR="$(dirname "$0")/../backend/certs"


mkdir -p $CERT_DIR
mkdir -p $VAULT_CERT_DIR
mkdir -p $NGINX_CERT_DIR
mkdir -p $PROM_CERT_DIR
mkdir -p $GRAFANA_CERT_DIR
mkdir -p $BACKEND_CERT_DIR

# Générer le certificat sans poser de questions (grâce à -subj)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.key" \
  -out "$CERT_DIR/cert.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=localhost"

chmod 644 "$CERT_DIR/key.key" "$CERT_DIR/cert.crt"

# Cert dédié vault (clé propre, ne pas réutiliser celle du WAF : domaines de confiance distincts)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$VAULT_CERT_DIR/vault.key" \
  -out "$VAULT_CERT_DIR/vault.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=vault" \
  -addext "subjectAltName=DNS:vault,DNS:localhost,IP:127.0.0.1"

chmod 644 "$VAULT_CERT_DIR/vault.key" "$VAULT_CERT_DIR/vault.crt"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$NGINX_CERT_DIR/nginx.key" \
  -out "$NGINX_CERT_DIR/nginx.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=nginx" \
  -addext "subjectAltName=DNS:nginx,DNS:localhost,IP:127.0.0.1"

chmod 644 "$NGINX_CERT_DIR/nginx.key" "$NGINX_CERT_DIR/nginx.crt"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$PROM_CERT_DIR/prometheus.key" \
  -out "$PROM_CERT_DIR/prometheus.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=prometheus" \
  -addext "subjectAltName=DNS:prometheus,DNS:localhost,IP:127.0.0.1"

chmod 644 "$PROM_CERT_DIR/prometheus.key" "$PROM_CERT_DIR/prometheus.crt"


openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$GRAFANA_CERT_DIR/grafana.key" \
  -out "$GRAFANA_CERT_DIR/grafana.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=grafana" \
  -addext "subjectAltName=DNS:grafana,DNS:localhost,IP:127.0.0.1"

chmod 644 "$GRAFANA_CERT_DIR/grafana.key" "$GRAFANA_CERT_DIR/grafana.crt"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$BACKEND_CERT_DIR/backend.key" \
  -out "$BACKEND_CERT_DIR/backend.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=backend" \
  -addext "subjectAltName=DNS:backend,DNS:localhost,IP:127.0.0.1"

chmod 644 "$BACKEND_CERT_DIR/backend.key" "$BACKEND_CERT_DIR/backend.crt"

echo "Certificats SSL générés avec succès dans $CERT_DIR, $VAULT_CERT_DIR, $NGINX_CERT_DIR, $PROM_CERT_DIR, $GRAFANA_CERT_DIR et $BACKEND_CERT_DIR !"
