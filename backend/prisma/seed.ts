// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create two user articles
  const post1 = await prisma.user.upsert({
    where: { name: "Ulli Rings2" },
    update: {},
    create: {
	name: "Ulli Rings2",
	user42Name: 'hrings2',
	email: "ulli@gmx.de",
	password: 'test2'
    },
  });

  const post2 = await prisma.user.upsert({
    where: { name: "Ulli Rings" },
    update: {},
    create: {
	name: "Ulli Rings",
	user42Name: 'hrings',
	password: 'test'
    },
  });

  const post3 = await prisma.user.upsert({
    where: { name: "Ulli Rings3" },
    update: {},
    create: {
	name: "Ulli Rings3",
	user42Name: "hrings3",
	password: "test3"
    },
  });

  const game1 = await prisma.game.upsert({
	where: { id: 1},
	update: {},
	create: {
		playerOneName: "Ulli Rings",
		playerTwoName: "Ulli Rings2"
		}
	});
	const game2 = await prisma.game.upsert({
		where: { id: 2},
		update: {},
		create: {
			playerOneName: "Ulli Rings",
			playerTwoName: "Ulli Rings3"
		}
  	})
  console.log({ post1, post2 , post3, game1, game2});
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