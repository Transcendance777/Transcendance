ui = true

# A activer en production
disable_mlock = true

log_level = "info"

api_addr     = "http://127.0.0.1:8200"
cluster_addr = "http://127.0.0.1:8201"

listener "tcp" {
    address         = "0.0.0.0:8200"
    cluster_address = "0.0.0.0:8201"

    tls_disable     = 1 # = HTTP
}

storage "file" {
    path = "/vault/data"
}