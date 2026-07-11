ui = true

# A activer en production
disable_mlock = true

log_level = "info"

api_addr     = "https://127.0.0.1:8200"
cluster_addr = "https://127.0.0.1:8201"

listener "tcp" {
    address         = "0.0.0.0:8200"
    cluster_address = "0.0.0.0:8201"

    tls_disable     = 0 # = HTTPS 
	tls_cert_file	= "/certs/vault.crt"
	tls_key_file	= "/certs/vault.key"
}

storage "file" {
    path = "/vault/data"
}
