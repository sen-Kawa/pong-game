import {  Injectable,
          NotFoundException,
          UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity'
import * as bcrypt from 'bcrypt';
import { UserResponseModel } from 'src/auth/model/user.response.model';
import { UserEntity } from '../users/entities/user.entity';
import { authenticator } from 'otplib';
import { UsersService } from '../users/users.service';
import { toDataURL } from 'qrcode';

export interface JwtPayload {
  userId: number,
	isTwoFaAuth : boolean
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private usersServive: UsersService) {}
  async validateUser(name: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { user42Name: name } });

    if (!user) {
      throw new NotFoundException(`No user found for Name: ${name}`);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return {
      userId: user.id,
      userName: user.name,
      user42Name: user.user42Name,
      email: user.email,
      activated2FA: user.activated2FA

    };
  }
  getToken(userid: number, twoFactor: boolean) {
    const payload: JwtPayload = {userId: userid, isTwoFaAuth: twoFactor}
    return this.jwtService.sign(payload);
  }

  async deactivate2FA(num: number) {
   try
   {
      await this.prisma.user.update({
        where: {id: num },
        data:{
          activated2FA:false
        }
      });
   }catch(error)
   {
    console.log( error );

   }
  }
  async activate2FA(num: number) {
    try
    {
       await this.prisma.user.update({
         where: {id: num },
         data:{
           activated2FA:true
         }
       });
    }catch(error)
    {
     console.log( error );
 
    }
   }
   async generate2FASecret(user: UserEntity)
   {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'AUTH_APP_NAME',
      secret,
    );
    await this.usersServive.setTwoFactorAuthenticationSecret(
      secret,
      user.id ,
    );
      return {
        secret, otpauthUrl
      }
   }

   async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async verify2FA(id: number, code: string)
  {
      try {
        const user = await this.usersServive.findOne(id);
        return authenticator.verify({
          token: code,
          secret: user.twoFactorAuthenticationSecret,
        });
      } catch (error){
        console.log( error );
      }
  }

}
