#!/bin/bash

set -e
# Dossier de stockage certificats
CERT_DIR="./waf/certs"

mkdir -p $CERT_DIR

# Générer le certificat sans poser de questions (grâce à -subj)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.key" \
  -out "$CERT_DIR/cert.crt" \
  -subj "/C=FR/ST=Paris/L=Paris/O=GameRev/CN=localhost"

chmod 600 "$CERT_DIR/key.key" "$CERT_DIR/cert.crt"

echo "Certificats SSL générés avec succès dans $CERT_DIR !"
