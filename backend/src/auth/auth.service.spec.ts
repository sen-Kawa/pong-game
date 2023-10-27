import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { ConfigService } from '@nestjs/config'
import prisma from 'src/prisma/__mocks__/prisma'
import { InternalServerErrorException } from '@nestjs/common'
import { UserEntity } from '../users/entities/user.entity'
import { authenticator } from 'otplib'
import { toDataURL } from 'qrcode'

describe('AuthService', () => {
  let service: AuthService
  let config: ConfigService

  jest.mock('src/prisma/prisma.service')
  jest.mock('@nestjs/jwt')

  const testRefreshToken = 'ThisIsARefreshToken'
  const testUser: UserEntity = {
    id: 1,
    displayName: 'Ulli',
    name: 'Ulli Rings',
    userName: 'hrings',
    email: 'test@gmx.de',
    activated2FA: false,
    currentStatus: 'OFFLINE',
    refreshToken: '',
    twoFactorAuthenticationSecret: 'ThisIsATwoFASecret',
    wins: 0,
    losses: 0,
    ratio: 0
  }
  const userWithOutRefreshToken = 42

  const mockUsersService = {
    sign: jest
      .fn()
      .mockImplementation((payload: any, options: { secret: string; expiresIn: string }) => {
        if (payload.isTwoFaAuth == undefined)
          return options.secret + options.expiresIn + payload.userId
        return options.secret + options.expiresIn + payload.userId + payload.isTwoFaAuth
      }),
    setTwoFactorAuthenticationSecret: jest.fn().mockImplementation((secret: string, id: number) => {
      secret += id
    }),
    findOne: jest.fn().mockImplementation((userId: number) => {
      if (userId == userWithOutRefreshToken)
        return {
          id: userId,
          refreshToken: null,
          activated2FA: true,
          twoFactorAuthenticationSecret: testUser.twoFactorAuthenticationSecret
        }
      else if (userId == testUser.id)
        return {
          id: userId,
          refreshToken: testRefreshToken,
          activated2FA: true,
          twoFactorAuthenticationSecret: testUser.twoFactorAuthenticationSecret
        }
      else if (userId == testUser.id + 1) return null
      throw new InternalServerErrorException('testError')
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, JwtService, UsersService, ConfigService, AuthService]
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(JwtService)
      .useValue(mockUsersService)
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile()

    service = module.get<AuthService>(AuthService)
    config = module.get<ConfigService>(ConfigService)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  it('getAccessToken should be called and called with the right value', () => {
    const spy = jest.spyOn(mockUsersService, 'sign')
    const testUserId = 10
    const testTwoFactor = false
    const accessSecret = config.get<string>('ACCESS_SECRET')
    const accessExpiration = config.get<string>('ACCESS_TOKEN_EXPIRATION')
    const result = accessSecret + accessExpiration + testUserId + testTwoFactor
    expect(service.getAccessToken(testUserId, testTwoFactor)).toStrictEqual(result)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      { isTwoFaAuth: testTwoFactor, userId: testUserId },
      { expiresIn: accessExpiration, secret: accessSecret }
    )
  })

  it('getRefreshToken should be called and called with the right value', () => {
    const spy = jest.spyOn(mockUsersService, 'sign')
    const testUserId = 10
    const refreshSecret = config.get<string>('REFRESH_SECRET')
    const refreshExpiration = config.get<string>('REFRESH_TOKEN_EXPIRATION')
    const result = refreshSecret + refreshExpiration + testUserId
    expect(service.getRefreshToken(testUserId)).toStrictEqual(result)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      { userId: testUserId },
      { expiresIn: refreshExpiration, secret: refreshSecret }
    )
  })

  it('updateRefreshToken should be called and called with the right value', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'update')
    const testUserId = 10
    const testToken = 'IamATestToken'
    await service.updateRefreshToken(testUserId, testToken)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: { id: testUserId },
      data: {
        refreshToken: testToken
      }
    })
  })

  it('updateRefreshToken throws an error if update User fails', async () => {
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('testError')
    })

    expect(async () => {
      const testUserId = 10
      const testToken = 'IamATestToken'
      await service.updateRefreshToken(testUserId, testToken)
    }).rejects.toThrow('updateRefreshToken')
  })

  it('deactivate2FA should be called and called with the right value', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'update')
    const testUserId = 10
    await service.deactivate2FA(testUserId)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: { id: testUserId },
      data: {
        activated2FA: false
      }
    })
  })

  it('deactivate2FA throws an error if update User fails', async () => {
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('testError')
    })

    expect(async () => {
      const testUserId = 10
      await service.deactivate2FA(testUserId)
    }).rejects.toThrow('deactivate2FA')
  })

  it('activate2FA should be called and called with the right value', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'update')
    const testUserId = 10
    await service.activate2FA(testUserId)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: { id: testUserId },
      data: {
        activated2FA: true
      }
    })
  })

  it('activate2FA throws an error if update User fails', async () => {
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('testError')
    })

    expect(async () => {
      const testUserId = 10
      await service.activate2FA(testUserId)
    }).rejects.toThrow('activate2FA')
  })

  it('generate2FASecret should be called and called with the right value', async () => {
    // @ts-ignore
    const spy = jest.spyOn(authenticator, 'generateSecret')
    const spy2 = jest.spyOn(authenticator, 'keyuri')
    const spy3 = jest.spyOn(mockUsersService, 'setTwoFactorAuthenticationSecret')

    const result = await service.generate2FASecret(testUser)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith()
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith(
      testUser.email,
      config.get<string>('AUTH_APP_NAME'),
      expect.any(String)
    )

    expect(spy3).toBeCalledTimes(1)
    expect(spy3).toHaveBeenCalledWith(expect.any(String), testUser.id)
    expect(result).toStrictEqual({
      otpauthUrl: expect.any(String),
      secret: expect.any(String)
    })
  })

  it('generateQrCodeDataURL should be called and called with the right value', async () => {
    const testUrl = 'www.test.com'
    const testResult = await toDataURL(testUrl)
    const result = await service.generateQrCodeDataURL(testUrl)
    expect(result).toStrictEqual(testResult)
  })
  it('verify2FA should be called and called with the right value', async () => {
    const spy = jest.spyOn(mockUsersService, 'findOne')
    const spy2 = jest.spyOn(authenticator, 'verify')
    const inputCode = '42'
    const result = await service.verify2FA(testUser.id, inputCode)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(testUser.id)
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith({
      token: inputCode,
      secret: testUser.twoFactorAuthenticationSecret
    })
    expect(result).toStrictEqual(false)
  })

  it('verify2FA throws an error if find a User fails', async () => {
    expect(async () => {
      await service.verify2FA(testUser.id + 42, '42')
    }).rejects.toThrow('verify2FA')
  })

  it('verifyRefreshToken should return true if called with a valid RefreshToken', async () => {
    const spy = jest.spyOn(mockUsersService, 'findOne')

    const result = await service.verifyRefreshToken(testUser.id, testRefreshToken)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(testUser.id)
    expect(result).toStrictEqual({ test: true, twoFactor: true })
  })

  it('verifyRefreshToken should return false if user isnt found', async () => {
    const spy = jest.spyOn(mockUsersService, 'findOne')

    const result = await service.verifyRefreshToken(testUser.id + 1, testRefreshToken)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(testUser.id + 1)
    expect(result).toStrictEqual({ test: false, twoFactor: false })
  })

  it('verifyRefreshToken should return false if false RefreshToken', async () => {
    const spy = jest.spyOn(mockUsersService, 'findOne')
    const failTestRefreshToken = 'This is a wrong Token'
    const result = await service.verifyRefreshToken(testUser.id, failTestRefreshToken)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(testUser.id)
    expect(result).toStrictEqual({ test: false, twoFactor: false })
  })

  it('verifyRefreshToken should return false if user has no RefreshToken', async () => {
    const spy = jest.spyOn(mockUsersService, 'findOne')
    const result = await service.verifyRefreshToken(userWithOutRefreshToken, testRefreshToken)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(userWithOutRefreshToken)
    expect(result).toStrictEqual({ test: false, twoFactor: false })
  })

  it('verifyRefreshToken throws an error if find a User fails', async () => {
    expect(async () => {
      await service.verifyRefreshToken(testUser.id + 42, '42')
    }).rejects.toThrow('verifyRefreshToken')
  })

  it('resetRefreshToken should be called and called with the right value', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'update')
    const testUserId = 10
    await service.resetRefreshToken(testUserId)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: { id: testUserId },
      data: {
        refreshToken: null
      }
    })
  })

  it('resetRefreshToken throws an error if update User fails', async () => {
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('testError')
    })

    expect(async () => {
      const testUserId = 10
      await service.resetRefreshToken(testUserId)
    }).rejects.toThrow('resetRefreshToken')
  })
})
