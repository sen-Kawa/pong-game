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
  const post1 = await prisma.user.create({
    data: {
      name: 'Ulli Rings2',
      userName: 'hrings2',
      email: 'ulli@gmx.de',
      activated2FA: false
    }
  })

  const post2 = await prisma.user.create({
    data: {
      name: 'Ulli Rings1',
      userName: 'hrings1',
      activated2FA: false
    }
  })

  const post3 = await prisma.user.create({
    data: {
      name: 'Ulli Rings3',
      userName: 'hrings3',
      activated2FA: false
    }
  })

  console.log({ post1, post2, post3 })

  const match = createFakeMatch({ completed: true })
  console.log(match)

  await prisma.match.create({ data: match })
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
