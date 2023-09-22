import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { Strategy } from 'passport-42'
import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../../users/users.service'

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy) {
  constructor(
    //private readonly authService: AuthService,
    private prisma: PrismaService,
    private config: ConfigService,
    private userService: UsersService
  ) {
    super({
      clientID: config.get<string>('CLIENTID'),
      clientSecret: config.get<string>('CLIENTSECRET'),
      callbackURL: config.get<string>('CALLLBACKURL'),
      scopes: ['public'],
      profileFields: {
        id42: function (obj) {
          return String(obj.id)
        },
        username: 'login',
        displayName: 'displayname',
        // 'name.familyName': 'last_name',
        // 'name.givenName': 'first_name',
        // 'profileUrl': 'url',
        email: 'email'
        //'emails.0.value': 'email',
        // 'phoneNumbers.0.value': 'phone',
        // 'photos.0.value': 'image_url'
      }
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    let user = await this.prisma.user.findUnique({ where: { userName: profile.username } })
    if (!user) {
      user = await this.userService.createUser(profile)
    }
    return user || null
  }
}
