npm install
npx prisma migrate reset -f
npx prisma db seed
npm run start:dev