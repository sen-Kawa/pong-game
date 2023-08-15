import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import {
  createFakeMatch,
  matchWithOnePlayer,
  matchWithScore,
  maximalMatch,
  minimalMatch
} from './match.test-data'

// initialize Prisma Client
const prisma = new PrismaClient()

const roundsOfHashing = 10

async function main() {
  // create two user articles
  const avatar1 = await prisma.userAvatar.upsert({
    where: {
      id: 1
    },
    update: {},
    create: {
      private: false,
      filename: 'default.jpg'
    }
  })
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
      activated2FA: false
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
      following: {
        connect: [{ id: user1.id }, { id: user3.id }]
      }
    }
  })

  console.log({ avatar1, user1, user2, user3, user4 })

  await prisma.match.create({ data: createFakeMatch({ completed: true }) })
  await prisma.match.create({ data: createFakeMatch() })
  await prisma.match.create({ data: createFakeMatch({ withPlayers: true }) })
  await prisma.match.create({ data: createFakeMatch({ withPlayers: true, completed: false }) })
  await prisma.match.create({
    data: createFakeMatch({ withPlayers: true, completed: true, maxScore: 9999 })
  })
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
