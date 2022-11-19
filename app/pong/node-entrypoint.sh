#!/bin/sh
set -e

cd pong

npm install

npx prisma migrate deploy

npx prisma generate

exec "$@"
