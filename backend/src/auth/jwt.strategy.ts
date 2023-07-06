import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {json, Request} from 'express';
import { jwtSecret } from './auth.module';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UsersService
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        var data = request?.cookies['auth-cookie'];
        if(data == null){
            return null;
        }
        ;
        return data.accessToken;
      }]),
    });
  }

  async validate(payload:any){
    const user = await this.userService.findOne( payload.userId );
    if ( user == undefined) throw new UnauthorizedException();
		if ( payload.auth == false) throw new UnauthorizedException();
		return user;
  }

}