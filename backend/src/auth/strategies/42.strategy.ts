import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable } from '@nestjs/common'
import { Strategy } from 'passport-42'
import { AuthService } from '../auth.service'
import { PrismaService } from './../../prisma/prisma.service'
import { ConfigService, ConfigModule } from '@nestjs/config'
@Injectable()
export class FTStrategy extends PassportStrategy(Strategy) {
  constructor(
    //private readonly authService: AuthService,
    private prisma: PrismaService,
    private config: ConfigService
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
    // console.log(profile)
    // console.log('Displayname: ', JSON.parse(profile._raw)['displayname']);
    // console.log('42ID:     ', profile.id42)
    // console.log('Username: ', profile.username);
    // console.log('Displayname: ', profile.displayName);
    // // return(profile);
    //TODO differ redirection depending if new user or not
    //TODO display name not default as username
    let user = await this.prisma.user.findUnique({ where: { userName: profile.username } })
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          displayName: profile.userName,
          name: profile.displayName,
          userName: profile.username,
          email: profile.email,
          activated2FA: false
        }
      })
    }
    return user || null
  }
}
