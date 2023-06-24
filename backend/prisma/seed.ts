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
    where: { name: "Ulli Rings2" },
    update: {
      password: test2
    },
    create: {
	name: "Ulli Rings2",
	user42Name: 'hrings2',
	email: "ulli@gmx.de",
	password: test2
    },
  });

  const post2 = await prisma.user.upsert({
    where: { name: "Ulli Rings" },
    update: {
      password: test1
    },
    create: {
	name: "Ulli Rings",
	user42Name: 'hrings',
	password: test1
    },
  });

  const post3 = await prisma.user.upsert({
    where: { name: "Ulli Rings3" },
    update: {
      password: test3
    },
    create: {
	name: "Ulli Rings3",
	user42Name: "hrings3",
	password: test3
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