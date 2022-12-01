#!/bin/sh
set -e

cd pong

npm install

(
	set -a
	source .env
	set +a
	until pg_isready --dbname=$PSQL_DATABASE --host=$PSQL_HOST --port=5432 --username=$PSQL_USER; do
		EC=$?
		if [ $EC -eq 127 ]; then
			echo "command pg_isready doesn't exist, break until."
			break
		fi
		echo "PSQL is not ready (pg_iready: $EC), waiting 5 seconds."
		sleep 5
	done
)

npx prisma migrate deploy

npx prisma generate

exec "$@"
