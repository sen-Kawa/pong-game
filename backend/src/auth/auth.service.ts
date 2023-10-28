import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { UserEntity } from '../users/entities/user.entity'
import { authenticator } from 'otplib'
import { UsersService } from '../users/users.service'
import { toDataURL } from 'qrcode'
import { ConfigService } from '@nestjs/config'

export interface JwtPayload {
  userId: number
  isTwoFaAuth: boolean
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersServive: UsersService,
    private config: ConfigService
  ) {}

  getAccessToken(userid: number, twoFactor: boolean) {
    // Cookie user.id spoofing point for testing alternate perceptions of clients' realities
    const payload: JwtPayload = { userId: userid, isTwoFaAuth: twoFactor }
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('ACCESS_SECRET'),
      expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRATION')
    })
  }

  getRefreshToken(userid: number) {
    return this.jwtService.sign(
      { userId: userid },
      {
        secret: this.config.get<string>('REFRESH_SECRET'),
        expiresIn: this.config.get<string>('REFRESH_TOKEN_EXPIRATION')
      }
    )
  }
  async updateRefreshToken(userid: number, Token: string) {
    try {
      await this.prisma.user.update({
        where: { id: userid },
        data: {
          refreshToken: Token
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('updateRefreshToken')
    }
  }

  async deactivate2FA(num: number) {
    try {
      await this.prisma.user.update({
        where: { id: num },
        data: {
          activated2FA: false
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('deactivate2FA')
    }
  }
  async activate2FA(num: number) {
    try {
      await this.prisma.user.update({
        where: { id: num },
        data: {
          activated2FA: true
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('activate2FA')
    }
  }

  async generate2FASecret(user: UserEntity) {
    const secret = authenticator.generateSecret()
    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.config.get<string>('AUTH_APP_NAME'),
      secret
    )
    await this.usersServive.setTwoFactorAuthenticationSecret(secret, user.id)
    return {
      secret,
      otpauthUrl
    }
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl)
  }

  async verify2FA(id: number, code: string) {
    try {
      const user = await this.usersServive.findOne(id)
      if (!user.twoFactorAuthenticationSecret) return false
      return authenticator.verify({
        token: code,
        secret: user.twoFactorAuthenticationSecret
      })
    } catch (error) {
      throw new InternalServerErrorException('verify2FA')
    }
  }

  async verifyRefreshToken(userId: number, refreshToken: string) {
    try {
      const user = await this.usersServive.findOne(userId)
      if (!user) return { test: false, twoFactor: false }
      else if (!user.refreshToken) return { test: false, twoFactor: false }
      else if (user.refreshToken != refreshToken) return { test: false, twoFactor: false }
      return { test: true, twoFactor: user.activated2FA }
    } catch (error) {
      throw new InternalServerErrorException('verifyRefreshToken')
    }
  }

  async resetRefreshToken(userId: number) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: null
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('resetRefreshToken')
    }
  }

  async verifyJwt(jwt: string) {
    try {
      const validToken = await this.jwtService.verifyAsync(jwt, { secret: process.env.JWTSECRET })
      if (!validToken) throw new UnauthorizedException()
      return validToken
    } catch (error) {
      // throw new InternalServerErrorException('verifyJwt')
    }
  }
}
