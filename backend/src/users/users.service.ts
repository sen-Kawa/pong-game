import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // async create(createUserDto: CreateUserDto) {
  //   const hashedPassword = await bcrypt.hash(
  //     createUserDto.password,
  //     roundsOfHashing,
  //   );

  //   createUserDto.password = hashedPassword;

  //   return this.prisma.user.create({
  //     data: createUserDto,
  //   });
  // }

  findAll() {
    return this.prisma.user.findMany({ take: 10 });
  }

  findOne(id: number) {
    return this.prisma.user.findFirst({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
    );
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    await this.prisma.user.update({ 
      where: {id : userId},
      data : {
        twoFactorAuthenticationSecret: secret
      }
  })
  }

  async createUser(username: string, password: string)
  {
    const user = await this.prisma.user.findUnique({ where: { userName: username,  loginType: 'LOCAL'} });
    if (user)
    {
      throw new BadRequestException('username already used');
    }
    const hashedPassword = await bcrypt.hash(
      password,
      roundsOfHashing,
    );
    return this.prisma.user.create({
      data: {
        userName: username,
        password: hashedPassword
      },
    });
  }
}
