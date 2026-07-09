#DevOps

path "secret/data/*" {
  capabilities = ["create", "read", "update", "list"]
  # pas de delete — suppression = action manuelle consciente, pas automatisable
}
path "secret/metadata/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
  # delete ici = supprimer les métadonnées/versions, pas les secrets eux-mêmes
}