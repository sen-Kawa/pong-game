import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// initialize Prisma Client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  // create two user articles

  const user1 = await prisma.user.create({
    data: {
	name: "Ulli Rings",
	userName: 'hrings',
	displayName: 'Ulli',
	email: "ulli@gmx.de",
	activated2FA: false,
    }
  })

  const user2 = await prisma.user.create({
    data: {
	name: "Jacob Thomsen",
	userName: 'jthomsen',
	displayName: 'Jacky',
	email: "jacob.thomsen@example.com",
  activated2FA: false,
	following: {
		connect: { id: user1.id },
	},
    }
  })

  const user3 = await prisma.user.create({
    data: {
	name: "Julia Hansen",
	userName: "jhansen",
	displayName: 'Juli',
	email: "julia.hansen@example.com",
  activated2FA: false,
	following: {
		connect: { id: user2.id },
	},
    }
  })

  const user4 = await prisma.user.create({
    data: {
	name: "Caroline Vasquez",
	userName: "cvasquez",
	displayName: 'Caro',
	email: "carito@example.com",
  activated2FA: false,
	following: {
		connect: [
		{ id: user1.id },
		{ id: user3.id },
		],
	},
    }
  })

  console.log({ user1, user2, user3, user4})
}

// execute the main function
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect()
  })
