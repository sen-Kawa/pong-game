import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from 'src/users/users.module'
import { ConfigModule } from '@nestjs/config'
import httpMocks = require('node-mocks-http')
import { UserEntity } from '../users/entities/user.entity'
import { ConfigService } from '@nestjs/config'

describe('AuthController', () => {
  let controller: AuthController
  let config: ConfigService

  const mockRequest = httpMocks.createRequest()
  const mockResponse = httpMocks.createResponse()
  const mockedUserID = 42
  mockRequest.user = new UserEntity({ id: mockedUserID })
  const mockAuthsService = {
    getAccessToken: jest.fn().mockImplementation((id: number, flag: boolean) => {
      return 'FakeAccessToken' + id + flag
    }),
    getRefreshToken: jest.fn().mockImplementation((id: number) => {
      return 'FakeRefreshToken' + id
    }),
    updateRefreshToken: jest.fn().mockImplementation((id: number, token: string) => {
      return token + id
    }),
    deactivate2FA: jest.fn().mockImplementation((id: number) => {
      return id
    }),
    generate2FASecret: jest.fn().mockImplementation((id: number) => {
      const otpauthUrl = 'FakeSecretUrl'
      const secret = 'Fake' + id
      return { otpauthUrl, secret }
    }),
    generateQrCodeDataURL: jest.fn().mockImplementation((secret: string) => {
      return 'FakeUrl' + secret
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, JwtModule, UsersModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService]
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthsService)
      .compile()
    config = module.get<ConfigService>(ConfigService)
    controller = module.get<AuthController>(AuthController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('callback should work and do a redirect to firsttime with no displayName', async () => {
    const spy = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy2 = jest.spyOn(mockAuthsService, 'getRefreshToken')
    const spy3 = jest.spyOn(mockResponse, 'cookie')
    const spy4 = jest.spyOn(mockAuthsService, 'updateRefreshToken')
    const spy5 = jest.spyOn(mockResponse, 'redirect')
    controller.handleCallback(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, false)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
    expect(spy3).toBeCalledTimes(2)
    expect(spy3).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy4).toBeCalledTimes(1)
    expect(spy4).toHaveBeenCalledWith(mockedUserID, 'FakeRefreshToken' + mockedUserID)
    expect(spy5).toBeCalledTimes(1)
    expect(spy5).toHaveBeenCalledWith(config.get<string>('FRONTEND_URL') + '/user/firsttime')
    expect(mockResponse.cookies).toStrictEqual({
      'auth-cookie': {
        options: {
          expires: expect.any(Date),
          httpOnly: true
        },
        value: 'FakeAccessToken42false'
      },
      'refresh-cookie': {
        options: {
          expires: expect.any(Date),
          httpOnly: true
        },
        value: 'FakeRefreshToken42'
      }
    })
    expect(mockResponse.statusCode).toStrictEqual(302)
  })

  it('callback should work and do a redirect to Preference with a displayName', async () => {
    mockRequest.user = new UserEntity({ id: mockedUserID, displayName: 'Test' })
    const spy = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy2 = jest.spyOn(mockAuthsService, 'getRefreshToken')
    const spy3 = jest.spyOn(mockResponse, 'cookie')
    const spy4 = jest.spyOn(mockAuthsService, 'updateRefreshToken')
    const spy5 = jest.spyOn(mockResponse, 'redirect')
    controller.handleCallback(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, false)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
    expect(spy3).toBeCalledTimes(2)
    expect(spy3).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy4).toBeCalledTimes(1)
    expect(spy4).toHaveBeenCalledWith(mockedUserID, 'FakeRefreshToken' + mockedUserID)
    expect(spy5).toBeCalledTimes(1)
    expect(spy5).toHaveBeenCalledWith(config.get<string>('FRONTEND_URL') + '/user/Preference')
    expect(mockResponse.cookies).toStrictEqual({
      'auth-cookie': {
        options: {
          expires: expect.any(Date),
          httpOnly: true
        },
        value: 'FakeAccessToken42false'
      },
      'refresh-cookie': {
        options: {
          expires: expect.any(Date),
          httpOnly: true
        },
        value: 'FakeRefreshToken42'
      }
    })
    expect(mockResponse.statusCode).toStrictEqual(302)
  })

  it('callback should work and do a redirect to 2fa with a displayName and 2fa activated', async () => {
    mockRequest.user = new UserEntity({ id: mockedUserID, displayName: 'Test', activated2FA: true })
    const spy = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy2 = jest.spyOn(mockAuthsService, 'getRefreshToken')
    const spy3 = jest.spyOn(mockResponse, 'cookie')
    const spy4 = jest.spyOn(mockAuthsService, 'updateRefreshToken')
    const spy5 = jest.spyOn(mockResponse, 'redirect')
    controller.handleCallback(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, false)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
    expect(spy3).toBeCalledTimes(2)
    expect(spy3).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy4).toBeCalledTimes(1)
    expect(spy4).toHaveBeenCalledWith(mockedUserID, 'FakeRefreshToken' + mockedUserID)
    expect(spy5).toBeCalledTimes(1)
    expect(spy5).toHaveBeenCalledWith(config.get<string>('FRONTEND_URL') + '/user/2fa')
    expect(mockResponse.cookies).toStrictEqual({
      'auth-cookie': {
        options: {
          expires: expect.any(Date),
          httpOnly: true
        },
        value: 'FakeAccessToken42false'
      },
      'refresh-cookie': {
        options: {
          expires: expect.any(Date),
          httpOnly: true
        },
        value: 'FakeRefreshToken42'
      }
    })
    expect(mockResponse.statusCode).toStrictEqual(302)
  })

  it('deactivate2FA should be called and with the right values', async () => {
    const spy = jest.spyOn(mockAuthsService, 'deactivate2FA')

    controller.deactivate2FA(mockRequest)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID)
  })

  it('activate2FA should be called and with the right values', async () => {
    const spy = jest.spyOn(mockAuthsService, 'generate2FASecret')
    const spy2 = jest.spyOn(mockAuthsService, 'generateQrCodeDataURL')
    const otpauthUrl = 'FakeSecretUrl'
    const result = await controller.activate2FA(mockRequest)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockRequest.user)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(otpauthUrl)
    expect(result).toStrictEqual({ url: 'FakeUrlFakeSecretUrl' })
  })

  it('userProfile should return the user Profil', async () => {
    const result = await controller.userProfile(mockRequest)
    expect(result).toStrictEqual(mockRequest.user)
  })
})
