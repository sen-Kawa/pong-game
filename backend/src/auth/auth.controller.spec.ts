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
import { JwtService } from '@nestjs/jwt'

describe('AuthController', () => {
  let controller: AuthController
  let config: ConfigService

  const mockRequest = httpMocks.createRequest()
  const mockResponse = httpMocks.createResponse()
  const mockedUserID = 42
  const mockCode = 'TestCode'
  const mockedRefreshToken = 'FakeRefreshToken'
  const mockedRefreshToken2 = 'TheOtherRefrshToken'
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
    }),
    resetRefreshToken: jest.fn().mockImplementation((id: number) => {
      return id
    }),
    verify2FA: jest.fn().mockImplementation((id: number, code: string) => {
      if (code == mockCode) return id
      else return null
    }),
    activate2FA: jest.fn().mockImplementation((id: number) => {
      return id
    }),
    decode: jest.fn().mockImplementation((token: string) => {
      if (token == mockedRefreshToken) {
        return {
          userId: mockedUserID,
          token: token
        }
      } else {
        return {
          userId: mockedUserID + 1,
          token: token
        }
      }
    }),
    verifyRefreshToken: jest.fn().mockImplementation((id: number, token: string) => {
      let test = false
      let twoFactor = true
      if (token == mockedRefreshToken || token == mockedRefreshToken2) test = true
      if (id == mockedUserID) twoFactor = false
      return { test, twoFactor }
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, JwtModule, UsersModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService, JwtService]
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthsService)
      .overrideProvider(JwtService)
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
    await controller.handleCallback(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, false)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
    expect(spy3).toBeCalledTimes(2)
    expect(spy3).toHaveBeenNthCalledWith(1, 'auth-cookie', expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy3).toHaveBeenNthCalledWith(2, 'refresh-cookie', expect.any(String), {
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
    await controller.handleCallback(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, false)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
    expect(spy3).toBeCalledTimes(2)
    expect(spy3).toHaveBeenNthCalledWith(1, 'auth-cookie', expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy3).toHaveBeenNthCalledWith(2, 'refresh-cookie', expect.any(String), {
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
    await controller.handleCallback(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, false)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
    expect(spy3).toBeCalledTimes(2)
    expect(spy3).toHaveBeenNthCalledWith(1, 'auth-cookie', expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy3).toHaveBeenNthCalledWith(2, 'refresh-cookie', expect.any(String), {
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

  it('logout should be called and with the right values', async () => {
    const spy = jest.spyOn(mockResponse, 'clearCookie')
    const spy2 = jest.spyOn(mockAuthsService, 'resetRefreshToken')
    const result = await controller.logout(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, 'auth-cookie')
    expect(spy).toHaveBeenNthCalledWith(2, 'refresh-cookie')
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
    expect(result).toStrictEqual({ msg: 'success' })
  })

  it('activate2fa should be called and with the right values', async () => {
    const spy = jest.spyOn(mockAuthsService, 'verify2FA')
    const spy2 = jest.spyOn(mockAuthsService, 'activate2FA')
    await controller.activate2fa(mockRequest, mockCode)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, mockCode)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID)
  })

  it('activate2fa should be throw an error if the codde is wrong', async () => {
    const mockWrongCode = 'WrongTestCode'
    const spy = jest.spyOn(mockAuthsService, 'verify2FA')

    expect(async () => {
      await controller.activate2fa(mockRequest, mockWrongCode)
    }).rejects.toThrow('Code could not be Validated')
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, mockWrongCode)
  })

  it('verify2FA should work and be called with the right values', async () => {
    mockRequest.user = new UserEntity({ id: mockedUserID, displayName: 'Test', activated2FA: true })
    const spy = jest.spyOn(mockAuthsService, 'verify2FA')
    const spy2 = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy3 = jest.spyOn(mockResponse, 'cookie')
    const spy4 = jest.spyOn(mockAuthsService, 'getRefreshToken')
    const spy5 = jest.spyOn(mockAuthsService, 'updateRefreshToken')
    await controller.verify2FA(mockRequest, mockCode, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, mockCode)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID, true)
    expect(spy3).toBeCalledTimes(2)
    expect(spy3).toHaveBeenNthCalledWith(1, 'auth-cookie', expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy3).toHaveBeenNthCalledWith(2, 'refresh-cookie', expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
    expect(spy4).toBeCalledTimes(1)
    expect(spy4).toHaveBeenCalledWith(mockedUserID)
    expect(spy5).toBeCalledTimes(1)
    expect(spy5).toHaveBeenCalledWith(mockedUserID, expect.any(String))
  })

  it('verify2FA should be throw an error if the codde is wrong', async () => {
    const mockWrongCode = 'WrongTestCode'
    const spy = jest.spyOn(mockAuthsService, 'verify2FA')

    expect(async () => {
      await controller.verify2FA(mockRequest, mockWrongCode, mockResponse)
    }).rejects.toThrow('Code could not be Validated')
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedUserID, mockWrongCode)
  })

  it('refresh should work and be called with the right values', async () => {
    const spy = jest.spyOn(mockAuthsService, 'decode')
    const spy2 = jest.spyOn(mockAuthsService, 'verifyRefreshToken')
    const spy3 = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy4 = jest.spyOn(mockResponse, 'cookie')

    mockRequest.cookies['refresh-cookie'] = mockedRefreshToken
    await controller.refreshTokens(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedRefreshToken)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID, mockedRefreshToken)
    expect(spy3).toBeCalledTimes(1)
    expect(spy3).toHaveBeenCalledWith(mockedUserID, false)
    expect(spy4).toBeCalledTimes(1)
    expect(spy4).toHaveBeenCalledWith('auth-cookie', expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
  })

  it('refresh should work and be called with the right values', async () => {
    const spy = jest.spyOn(mockAuthsService, 'decode')
    const spy2 = jest.spyOn(mockAuthsService, 'verifyRefreshToken')
    const spy3 = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy4 = jest.spyOn(mockResponse, 'cookie')
    mockRequest.user = new UserEntity({
      id: mockedUserID + 1,
      displayName: 'Test',
      activated2FA: true
    })
    mockRequest.cookies['refresh-cookie'] = mockedRefreshToken2
    await controller.refreshTokens(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(mockedRefreshToken2)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID + 1, mockedRefreshToken2)
    expect(spy3).toBeCalledTimes(1)
    expect(spy3).toHaveBeenCalledWith(mockedUserID + 1, true)
    expect(spy4).toBeCalledTimes(1)
    expect(spy4).toHaveBeenCalledWith('auth-cookie', expect.any(String), {
      httpOnly: true,
      expires: expect.any(Date)
    })
  })

  it('refresh should throw an error if wrong refreshtoken', async () => {
    const spy = jest.spyOn(mockAuthsService, 'decode')
    const spy2 = jest.spyOn(mockAuthsService, 'verifyRefreshToken')
    const spy3 = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy4 = jest.spyOn(mockResponse, 'cookie')
    mockRequest.user = new UserEntity({
      id: mockedUserID + 1,
      displayName: 'Test',
      activated2FA: true
    })
    mockRequest.cookies['refresh-cookie'] = 'WrongRefreshToken'

    expect(async () => {
      await controller.refreshTokens(mockRequest, mockResponse)
    }).rejects.toThrow('No Valid RefreshToken')
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('WrongRefreshToken')
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(mockedUserID + 1, 'WrongRefreshToken')
    expect(spy3).toBeCalledTimes(0)
    expect(spy4).toBeCalledTimes(0)
  })

  it('refresh should throw an error if no refreshtoken', async () => {
    const spy = jest.spyOn(mockAuthsService, 'decode')
    const spy2 = jest.spyOn(mockAuthsService, 'verifyRefreshToken')
    const spy3 = jest.spyOn(mockAuthsService, 'getAccessToken')
    const spy4 = jest.spyOn(mockResponse, 'cookie')
    mockRequest.user = new UserEntity({
      id: mockedUserID + 1,
      displayName: 'Test',
      activated2FA: true
    })
    mockRequest.cookies['refresh-cookie'] = null

    expect(async () => {
      await controller.refreshTokens(mockRequest, mockResponse)
    }).rejects.toThrow('No Valid RefreshToken')
    expect(spy).toBeCalledTimes(0)
    expect(spy2).toBeCalledTimes(0)
    expect(spy3).toBeCalledTimes(0)
    expect(spy4).toBeCalledTimes(0)
  })
})
