import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(readonly config: ConfigService) {
    super({
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: config.get<string>('REFRESH_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (!request.cookies) {
            return null
          }
          return request?.cookies['refresh-cookie']
        }
      ])
    })
  }

  async validate(payload: any) {
    return payload
  }
}
