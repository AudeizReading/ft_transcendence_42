# project42_transcendence

## Installation:

### Back

#### Apply Migration of psql

Prepare Postgres (Docker with psql should be running `make`).

```
cd app/pong
npm install
npx prisma migrate deploy
```

## Usage

### How to run project for dev ?

Open 3 terminal session:
 - `make` to run docker and database ;
 - `make run_front` to run front (React) ;
 - `make run_back` to run back (Nestjs).

## Docs :

 - **Material-ui docs:** https://mui.com/material-ui/getting-started/usage/
 - **Nestjs docs:** https://docs.nestjs.com/
 - **Prisma docs:** https://www.prisma.io/docs/
