import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { ConfigService } from '@nestjs/config'
import prisma from 'src/prisma/__mocks__/prisma'

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService
  let config: ConfigService
  jest.mock('src/prisma/prisma.service')
  jest.mock('@nestjs/jwt')
  const mockUsersService = {
    sign: jest
      .fn()
      .mockImplementation((payload: any, options: { secret: string; expiresIn: string }) => {
        if (payload.isTwoFaAuth == undefined)
          return options.secret + options.expiresIn + payload.userId
        return options.secret + options.expiresIn + payload.userId + payload.isTwoFaAuth
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
})
