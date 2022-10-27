#!/bin/sh

cd "$(dirname "$0")"

function urlencode() {
  echo $(python -c "import sys, urllib as ul; print ul.quote_plus('$1')")
}

if [ -f "pong/.env" ]; then
  echo ".env already exist"
else
  echo "create pong/.env"
  PSQL_PWD="$(openssl rand -base64 32)"
  cat << EOF > pong/.env
#NODE
HOST=localhost

#API
API_42_UID="$(printf "1) Write your uid api: " 1>&2;read api;echo $api)"
API_42_SECRET="$(printf "2) Write your secret api: " 1>&2;read api;echo $api)"

#USER
N_USER=user
N_PASS="$(openssl rand -base64 12)"

#PSQL
PSQL_HOST=psql
PSQL_DATABASE=pong
PSQL_USER=pong
PSQL_PASSWORD="$PSQL_PWD"
PSQL_URL="postgresql://pong:$(urlencode "$PSQL_PWD")@psql:5432/pong"
EOF
fi
