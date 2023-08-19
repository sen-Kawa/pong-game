import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import prisma from 'src/prisma/__mocks__/prisma'
import * as request from 'supertest'
import { AppModule } from '../app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { MockAuthGuard } from './mock-auth.guard'
import { Mock42AuthGuard } from './mock-42-auth.guard'
import { Mock2FAAuthGuard } from './mock-2fa-auth.guard'
import { AuthGuard } from '@nestjs/passport'
import { TFAAuthGuard } from 'src/auth/guards/2fa-auth.guard'

describe('Test for diffrent routes', () => {
  describe('Tests for the users routes', () => {
    let app: INestApplication
    const frontUrl = process.env.FRONTEND_URL
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
      })
        .overrideProvider(PrismaService)
        .useValue(prisma)
        .overrideGuard(JwtAuthGuard)
        .useClass(MockAuthGuard)
        .overrideGuard(TFAAuthGuard)
        .useClass(Mock2FAAuthGuard)
        .overrideGuard(AuthGuard('42'))
        .useClass(Mock42AuthGuard)
        .compile()

      app = moduleFixture.createNestApplication()
      app.useGlobalPipes(new ValidationPipe())
      app.useGlobalGuards(new MockAuthGuard())

      await app.init()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    // very basic testing as hard to test diffrent stuff here
    // [GET] /auth/callback
    it('[GET] /auth/callback will redirect to a frontend part', async () => {
      const { status, body, header } = await request(app.getHttpServer())
        .get('/auth/callback')
        .set('Accept', 'application/json')
      expect(body).toStrictEqual({})
      expect(status).toBe(302)
      expect(header.location).toStrictEqual(frontUrl + '/user/firsttime')
    })
    // [GET] /auth/deactivate2FA
    it('[GET] /auth/deactivate2FA valid request works', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/auth/deactivate2FA')
        .set('Accept', 'application/json')
      expect(body).toStrictEqual({})
      expect(status).toBe(200)
    })
    // [GET] /auth/activate2FA
    it('[GET] /auth/activate2FA valid request works', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/auth/activate2FA')
        .set('Accept', 'application/json')
      expect(body).toStrictEqual({ url: expect.any(String) })
      expect(status).toBe(200)
    })
    // [GET] /auth/user-profile
    it('[GET] /auth/user-profile valid request works', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/auth/user-profile')
        .set('Accept', 'application/json')
      expect(body).toStrictEqual({ id: 1 })
      expect(status).toBe(200)
    })
    // [GET] /auth/logout
    it('[GET] /auth/logout valid request works', async () => {
      const { status, body } = await request(app.getHttpServer())
        .get('/auth/logout')
        .set('Accept', 'application/json')
      expect(body).toStrictEqual({ msg: 'success' })
      expect(status).toBe(200)
    })

    //TODO find out how to mock the validator
    // [POST] /auth/verifyactivate2fa
    it('[POST] /auth/verifyactivate2fa invalid request returns an error', async () => {
      const mockUser = { id: 1, twoFactorAuthenticationSecret: '123456' }
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/auth/verifyactivate2fa')
        .set('Accept', 'application/json')
        .send('123456')
      expect(body).toStrictEqual({ message: 'Code could not be Validated', statusCode: 403 })
      expect(status).toBe(403)
    })

    //TODO find out how to mock the validator
    // [POST] /auth/verify2FA
    it('[POST] /auth/verify2FA invalid request returns an error', async () => {
      const mockUser = { id: 1, twoFactorAuthenticationSecret: '123456' }
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .post('/auth/verify2FA')
        .set('Accept', 'application/json')
        .send('123456')
      expect(body).toStrictEqual({ message: 'Code could not be Validated', statusCode: 403 })
      expect(status).toBe(403)
    })

    //TODO find out how to mock the validator and cookie
    // [GET] /auth/refresh
    it('[GET] /auth/refresh invalid request returns an error', async () => {
      const mockUser = { id: 1, twoFactorAuthenticationSecret: '123456' }
      // @ts-ignore
      prisma.user.findUnique.mockResolvedValue(mockUser as any)
      const { status, body } = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Accept', 'application/json')
      expect(body).toStrictEqual({ message: 'Unauthorized', statusCode: 401 })
      expect(status).toBe(401)
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

    afterEach(() => {
      jest.clearAllMocks()
    })
    it('[GET] /auth/42login guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/auth/42login')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')

      expect(status).toBe(302)
    })
    it('[GET] /auth/callback guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/auth/callback')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
      expect(status).toBe(302)
    })
    it('[GET] /auth/deactivate2FA guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/auth/deactivate2FA')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[GET] /auth/activate2FA guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/auth/activate2FA')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[GET] /auth/user-profile guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/auth/user-profile')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[GET] /auth/logout guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/auth/logout')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[POST] /auth/verifyactivate2fa guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/auth/verifyactivate2fa')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[POST] /auth/verify2FA guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .post('/auth/verify2FA')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
    it('[GET] /auth/refresh guard test', async () => {
      const { status } = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Accept', 'application/json')
        .set('auth-cookie', '')
        .expect('Content-Type', /json/)
      expect(status).toBe(401)
    })
  })
})
