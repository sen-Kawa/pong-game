import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'

export function createFakeUser(): Prisma.UserCreateInput {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = faker.internet.email({ firstName, lastName })
  return {
    displayName: firstName,
    userName: faker.internet.userName({ firstName, lastName }),
    name: lastName,
    email: email
  }
}
