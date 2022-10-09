#!/bin/sh
set -e

cd nodejs

npm install

exec "$@"
