import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function createFakeUser(): Prisma.UserCreateInput {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = faker.internet.email({ firstName, lastName })
  const losses = getRandomInt(10)
  const wins = getRandomInt(10)
  const ratio = (losses + wins) == 0 ? 0 : wins / (losses + wins)
  return {
    displayName: firstName,
    userName: faker.internet.userName({ firstName, lastName }),
    name: lastName,
    email: email,
    losses: losses,
    wins: wins,
    ratio: ratio
  }
}
