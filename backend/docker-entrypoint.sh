#!/bin/sh
# npm install
echo "backend entrypoint: setup the database now..."
npx prisma migrate dev
npx prisma db seed

exec npm run start:dev
