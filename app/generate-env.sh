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
API_42_UID="$(printf "1) Write your uid api: " 1>&2;read api;echo $api)"
API_42_SECRET="$(printf "2) Write your secret api: " 1>&2;read api;echo $api)"

#USER
N_USER=user
N_PASS="$(openssl rand -base64 12)"

#MARIADB
PSQL_HOST=psql
PSQL_DATABASE=pong
PSQL_USER=pong
PSQL_PASSWORD="$(openssl rand -base64 32)"
EOF
fi
