import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// initialize Prisma Client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  // create two user articles
  const test1 = await bcrypt.hash('test1', roundsOfHashing);
  const test2 = await bcrypt.hash('test2', roundsOfHashing);
  const test3 = await bcrypt.hash('test3', roundsOfHashing);

  const post1 = await prisma.user.upsert({
    where: { id: 1 },
    update: {
      password: test2
    },
    create: {
	name: "Ulli Rings2",
	userName: 'hrings2',
	email: "ulli@gmx.de",
	password: test2,
  activated2FA: false,
  loginType: 'LOCAL',
    },
  });

  const post2 = await prisma.user.upsert({
    where: { id: 2 },
    update: {
      password: test1,
      activated2FA: true
    },
    create: {
	name: "Ulli Rings",
	userName: 'hrings',
	password: test1,
  activated2FA: false,
  loginType: 'LOCAL',
    },
  });

  const post3 = await prisma.user.upsert({
    where: { id: 3 },
    update: {
      password: test3,
      activated2FA: true
    },
    create: {
	name: "Ulli Rings3",
	userName: "hrings3",
	password: test3,
  activated2FA: false,
  loginType: 'LOCAL',
    },
  });

  console.log({ post1, post2 , post3});
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });