import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { json, Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly userService: UsersService,
    readonly config: ConfigService
  ) {
    super({
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.get<string>('REFRESH_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['refresh-cookie']
          if (data == null) {
            return null
          }
          return data
        }
      ])
    })
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req?.cookies['refresh-cookie']
    return { ...payload, refreshToken }
  }
}
