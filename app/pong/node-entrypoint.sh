#!/bin/sh
set -e

cd pong

npm install

exec "$@"
