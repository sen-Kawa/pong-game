import { BadRequestException, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { UserDto } from './dto/user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'

export const roundsOfHashing = 10

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ take: 10 })
  }

  async findAllFriends(id: number) {
    let result = await this.prisma.user.findMany({
      where: {
        id: id
      },
      select: {
        following: {
          select: {
            userName: true,
            displayName: true
          }
        }
      }
    })
    return result[0].following
  }

  findOne(id: number) {
    return this.prisma.user.findFirst({ where: { id } })
  }

  async updateDisplayName(id: number, updateUserDto: UpdateUserDto) {

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto
    })
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } })
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorAuthenticationSecret: secret
      }
    })
  }

  //TODO check if already friend?
  async addFriend(userId: number, friendName: string) {
    const user = await this.prisma.user.findFirst({ where: { displayName: friendName } })
    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN)
    else if (user.id == userId)
      throw new HttpException('cant be friend with yourslef', HttpStatus.FORBIDDEN)

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        following: {
          connect: {
            id: user.id
          }
        }
      }
    })
  }

  async removeFriend(userId: number, friendName: string) {
    const user = await this.prisma.user.findFirst({ where: { displayName: friendName } })
    if (!user) throw new HttpException('User not found', HttpStatus.FORBIDDEN)
    else if (user.id == userId)
      throw new HttpException('cant be friend with yourslef', HttpStatus.FORBIDDEN)

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        following: {
          disconnect: {
            id: user.id
          }
        }
      }
    })
  }

  async findUser(name: string) {
    let result = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            userName: {
              startsWith: name
            }
          },
          {
            displayName: {
              startsWith: name
            }
          }
        ]
      },
      select: {
        userName: true,
        displayName: true
      }
    })
    return result
  }
}
