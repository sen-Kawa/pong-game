import { PassportStrategy } from "@nestjs/passport";
import { Inject, Injectable } from "@nestjs/common";
import { Strategy } from 'passport-42';
import { AuthService } from "../auth.service";
import { PrismaService } from './../../prisma/prisma.service';

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy) {
    constructor(
       //private readonly authService: AuthService,
		private prisma: PrismaService
    ) {
        super({
            clientID: 'u-s4t2ud-1cf99f3d4feb92430dd36006565dae3b8eb14ec3ceed4490d2eb1c125a36b64e',
            clientSecret: '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',
            // callbackURL: 'http://localhost:3000/auth/callback',
            callbackURL: '/auth/callback',
            scopes: ['public'],
            profileFields: {
                'id42': function (obj) { return String(obj.id); },
                'username': 'login',
                'displayName': 'displayname',
                // 'name.familyName': 'last_name',
                // 'name.givenName': 'first_name',
                // 'profileUrl': 'url',
                'email': 'email',
                //'emails.0.value': 'email',
                // 'phoneNumbers.0.value': 'phone',
                // 'photos.0.value': 'image_url'
              }
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
        // console.log(profile)
        // console.log('Displayname: ', JSON.parse(profile._raw)['displayname']);
        // console.log('42ID:     ', profile.id42)
        // console.log('Username: ', profile.username);
        // console.log('Displayname: ', profile.displayName);
        // // return(profile);
		let user = await this.prisma.user.findUnique({ where: { user42Name: profile.username } });
		if (!user)
		{
			user = await this.prisma.user.create({
				data: {
					name: profile.displayName,
					user42Name: profile.username,
					email: profile.email,
					activated2FA: false,
					//TODO remove password o.O
					password: "lalala"
				}
			})
		}
        return user || null;
    }
}