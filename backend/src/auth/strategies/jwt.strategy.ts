import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UsersService,
    readonly config: ConfigService
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWTSECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let data: any
          try {
            data = request?.cookies['auth-cookie']
          } catch {
            try {
              data = parseCookie(request['handshake']['headers']['cookie'])
            } catch {
              data = null
            }
          }

          if (data === null || data === undefined) {
            return null
          }
          return data
        }
      ])
    })
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.userId)
    if (user == undefined) throw new UnauthorizedException()
    if (user.activated2FA != payload.isTwoFaAuth) throw new UnauthorizedException()
    return user
  }
}

function parseCookie(cookie: string) {
  const cookies = cookie.split(';')
  const cookieMap = []
  cookies.map((cookie) => {
    const split = cookie.split('=')
    cookieMap[split[0].trim()] = split[1]
  })

  return cookieMap['auth-cookie']
}
