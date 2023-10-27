import { PrismaClient } from '@prisma/client'
import { createFakeMatch, createFakeTournament } from './match.test-data'

// initialize Prisma Client
const prisma = new PrismaClient()

async function main() {
  // create two user articles
  // const avatar1 = await prisma.userAvatar.upsert({
  //   where: {
  //     id: 1
  //   },
  //   update: {},
  //   create: {
  //     private: false,
  //     filename: 'default.jpg'
  //   }
  // })
  const user1 = await prisma.user.upsert({
    where: {
      userName: 'test'
    },
    update: {},
    create: {
      name: 'Ulli Test',
      userName: 'test',
      displayName: 'Ulli',
      email: 'ulli@gmx.de',
      activated2FA: false,
      losses: 0,
      wins: 20,
      ratio: 20 / (0 + 20)
    }
  })

  const user2 = await prisma.user.upsert({
    where: {
      userName: 'jthomsen'
    },
    update: {},
    create: {
      name: 'Jacob Thomsen',
      userName: 'jthomsen',
      displayName: 'Jacky',
      email: 'jacob.thomsen@example.com',
      activated2FA: false,
      losses: 20,
      wins: 0,
      ratio: 0 / (20 + 0),
      following: {
        connect: { id: user1.id }
      }
    }
  })

  const user3 = await prisma.user.upsert({
    where: {
      userName: 'jhansen'
    },
    update: {},
    create: {
      name: 'Julia Hansen',
      userName: 'jhansen',
      displayName: 'Juli',
      email: 'julia.hansen@example.com',
      activated2FA: false,
      losses: 10,
      wins: 10,
      ratio: 10 / (10 + 10),
      following: {
        connect: { id: user2.id }
      }
    }
  })

  const user4 = await prisma.user.upsert({
    where: {
      userName: 'cvasquez'
    },
    update: {},
    create: {
      name: 'Caroline Vasquez',
      userName: 'cvasquez',
      displayName: 'Caro',
      email: 'carito@example.com',
      activated2FA: false,
      losses: 20,
      wins: 20,
      ratio: 20 / (20 + 20),
      following: {
        connect: [{ id: user1.id }, { id: user3.id }]
      }
    }
  })

  console.log({ user1, user2, user3, user4 })

  //create alot of matches where players play more matches
  const tournamentMatches = createFakeTournament(5)
  for (const match of tournamentMatches) {
    const m = await prisma.match.create({ data: match })
    console.debug({ m })
  }
  for(let i = 1; i < 15; ++i)
  {
    console.log(await prisma.profile_pic.upsert({
      where: { userId: i },
      update: {},
      create:{
        userId: i
      }
    }))
  }
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