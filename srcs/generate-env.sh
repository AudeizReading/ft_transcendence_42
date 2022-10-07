#!/bin/sh

cd "$(dirname "$0")"

if [ -f ".env" ]; then
  echo ".env already exist"
else
  echo "create .env"
  cat << EOF > .env
#NODE
HOST=localhost

#API
API_42_SECRET="$(echo "secret api:";read api;echo $api)"

#USER
N_USER=user
N_PASS="$(openssl rand -base64 12)"

#MARIADB
PSQL_HOST=psql
PSQL_DATABASE=transcendence
PSQL_USER=transcendence
PSQL_PASSWORD="$(openssl rand -base64 32)"
PSQL_ROOT_PASSWORD="$(openssl rand -base64 32)"
EOF
fi
