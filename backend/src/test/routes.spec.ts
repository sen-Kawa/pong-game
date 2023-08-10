import { Test, TestingModule } from '@nestjs/testing'
import { describe } from 'node:test'
import { PrismaService } from 'src/prisma/prisma.service'
import prisma from 'src/prisma/__mocks__/prisma'
import * as request from 'supertest'
import { AppModule } from '../app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'

import { MockAuthGuard } from './mock-auth.guard'

describe('Test for diffrent routes', () => {
  describe('Tests for the users routes', () => {
    let app: INestApplication

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
      })
        .overrideProvider(PrismaService)

        .useValue(prisma)
        .overrideGuard(JwtAuthGuard)
        .useClass(MockAuthGuard)
        .compile()

      app = moduleFixture.createNestApplication()
      app.useGlobalPipes(new ValidationPipe())
      app.useGlobalGuards(new MockAuthGuard())
      await app.init()
    })
    it('[GET] /users/friends valid request returns list', async () => {
      // @ts-ignore
      const spy = jest.spyOn(prisma.user, 'findMany')
      const mockFriendList = [
        {
          following: [
            { id: 1, name: 'test', displayName: 'displayTest', userName: 'test' },
            { id: 2, name: 'test2', displayName: 'displayTest2', userName: 'test2' }
          ]
        }
      ]
      const resultFriendList = [
        { id: 1, name: 'test', displayName: 'displayTest', userName: 'test' },
        { id: 2, name: 'test2', displayName: 'displayTest2', userName: 'test2' }
      ]
      prisma.user.findMany.mockResolvedValue(mockFriendList as any)

      const { status, body } = await request(app.getHttpServer())
        .get('/users/friends')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
      expect(spy).toBeCalledTimes(1)
      expect(spy).toHaveBeenCalledWith({
        where: {
          id: 1
        },
        select: {
          following: {
            select: {
              id: true,
              userName: true,
              displayName: true
            }
          }
        }
      })
      expect(body).toStrictEqual(resultFriendList)
      expect(status).toBe(200)
    })
  })
  describe('Test if all routes are guarded', () => {
    let app: INestApplication

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
      })
        .overrideProvider(PrismaService)

        .useValue(prisma)
        .compile()

      app = moduleFixture.createNestApplication()
      app.useGlobalPipes(new ValidationPipe())
      await app.init()
    })

    it('[GET] /users/friends guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/users/friends')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[POST] /users/find guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/users/find')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
        .send({})
      expect(status).toBe(401)
    })
    it('[POST] /users/addFriend guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/users/addFriend')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
        .send({})
      expect(status).toBe(401)
    })
    it('[DELETE] /users/removeFriend guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .delete('/users/removeFriend')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
        .send({})
      expect(status).toBe(401)
    })
    it('[PATCH] /users/changeDisplay guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .patch('/users/changeDisplay')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .send({})
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[POST] /users/upload guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/users/upload')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .send({})
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[GET] /users/userImage guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/users/userImage')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
  })
})
