import {  Injectable,
          NotFoundException,
          UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity'
import * as bcrypt from 'bcrypt';
import { UserResponseModel } from 'src/auth/model/user.response.model';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}
  async validateUser(name: string, password: string): Promise<AuthEntity> {
    console.log(name);
    console.log(password);
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
      email: user.email
    };
  }
  async getToken(user: AuthEntity) {
    return this.jwtService.sign(user);
  }

}
