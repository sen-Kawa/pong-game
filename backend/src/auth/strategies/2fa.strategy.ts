import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {json, Request} from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TwoFAStrategy extends PassportStrategy(Strategy, '2fa') {
  constructor(
    private readonly userService: UsersService,
    readonly config: ConfigService
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWTSECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        var data = request?.cookies['auth-cookie'];
        if(data == null){
            return null;
        }
        ;
        return data;
      }]),
    });
  }

  async validate(payload:any){
    const user = await this.userService.findOne( payload.userId );
    if ( user == undefined) throw new UnauthorizedException();
	  if ( payload.isTwoFaAuth != payload.isTwoFaAuth) throw new UnauthorizedException();
	return user;
  }
}