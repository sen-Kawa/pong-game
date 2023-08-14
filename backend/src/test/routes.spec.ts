import { Test, TestingModule } from '@nestjs/testing'
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
    // [GET] /users/friends friends
    it('[GET] /users/friends valid request returns list', async () => {
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
      // @ts-ignore
      prisma.user.findMany.mockResolvedValue(mockFriendList as any)

      const { status, body } = await request(app.getHttpServer())
        .get('/users/friends')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
      expect(body).toStrictEqual(resultFriendList)
      expect(status).toBe(200)
    })
    // [POST] /users/find tests
    it('[GET] /users/find valid request returns list', async () => {
      const mockUserList = [
        {
          following: [
            { displayName: 'displayTest', userName: 'test' },
            { displayName: 'displayTest2', userName: 'test2' }
          ]
        }
      ]
      prisma.user.findMany.mockResolvedValue(mockUserList as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/users/find')
        .set('Accept', 'application/json')
        .send({ name: 'nameBody' })
        .expect('Content-Type', /json/)

      expect(body).toStrictEqual(mockUserList)
      expect(status).toBe(200)
    })
    it('[GET] /users/find short name returns an error', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/users/find')
        .set('Accept', 'application/json')
        .send({ name: 'na' })
        .expect('Content-Type', /json/)
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['name must be longer than or equal to 3 characters'],
        statusCode: 400
      })
      expect(status).toBe(400)
    })

    it('[GET] /users/find with number returns an error', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/users/find')
        .set('Accept', 'application/json')
        .send({ name: 1111 })
        .expect('Content-Type', /json/)
      expect(body).toStrictEqual({
        message: [
          'name must be a string',
          'name must be longer than or equal to 3 and shorter than or equal to undefined characters'
        ],
        error: 'Bad Request',
        statusCode: 400
      })
      expect(status).toBe(400)
    })
    it('[GET] /users/find with an empty string returns an error', async () => {
      const { status, body } = await request(app.getHttpServer())
        .post('/users/find')
        .set('Accept', 'application/json')
        .send({ name: '' })
        .expect('Content-Type', /json/)
      expect(body).toStrictEqual({
        message: ['name should not be empty', 'name must be longer than or equal to 3 characters'],
        error: 'Bad Request',
        statusCode: 400
      })
      expect(status).toBe(400)
    })
    // [POST] /users/addFriend tests
    it('[GET] /users/addFriend valid request returs code 200', async () => {
      const mockUser = { id: 2 }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/users/addFriend')
        .set('Accept', 'application/json')
        .send({ friendName: 'nameBody' })

      expect(body).toStrictEqual({})
      expect(status).toBe(200)
    })

    it('[GET] /users/addFriend not valid request returs an error', async () => {
      const mockUser = { id: 2 }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/users/addFriend')
        .set('Accept', 'application/json')
        .send({ friendName: 'na' })

      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['friendName must be longer than or equal to 3 characters'],
        statusCode: 400
      })
      expect(status).toBe(400)
    })

    it('[GET] /users/addFriend with a number returs an error', async () => {
      const mockUser = { id: 2 }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/users/addFriend')
        .set('Accept', 'application/json')
        .send({ friendName: 111 })

      expect(body).toStrictEqual({
        message: [
          'friendName must be a string',
          'friendName must be longer than or equal to 3 and shorter than or equal to undefined characters'
        ],
        error: 'Bad Request',
        statusCode: 400
      })
      expect(status).toBe(400)
    })
    it('[GET] /users/addFriend with an empty value returns an error', async () => {
      const mockUser = { id: 2 }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/users/addFriend')
        .set('Accept', 'application/json')
        .send({ friendName: '' })

      expect(body).toStrictEqual({
        message: [
          'friendName should not be empty',
          'friendName must be longer than or equal to 3 characters'
        ],
        error: 'Bad Request',
        statusCode: 400
      })
      expect(status).toBe(400)
    })
    it('[GET] /users/addFriend yourself should returns an error', async () => {
      const mockUser = { id: 1 }
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/users/addFriend')
        .set('Accept', 'application/json')
        .send({ friendName: 'test' })

      expect(body).toStrictEqual({
        message: "Can't add yourself!",
        statusCode: 403
      })
      expect(status).toBe(403)
    })
    it('[GET] /users/addFriend adding an none existing useer returns an error', async () => {
      prisma.user.findUnique.mockResolvedValue(null as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/users/addFriend')
        .set('Accept', 'application/json')
        .send({ friendName: 'test' })

      expect(body).toStrictEqual({
        message: 'User not found',
        statusCode: 404
      })
      expect(status).toBe(404)
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
    it('[PATCH] /users/changeStatus guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .patch('/users/changeStatus')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
  })
})
