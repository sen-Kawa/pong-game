import { BadRequestException, Injectable, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common'
import { UserDto } from './dto/user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { Status } from "@prisma/client";
export const roundsOfHashing = 10

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

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
            id: true,
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
    const test = await this.prisma.user.findUnique({
      where: {
        displayName: updateUserDto.displayName
      }
    })
    if (test)
      throw new HttpException("DisplayName already taken", HttpStatus.FORBIDDEN)
    try {
      const result = this.prisma.user.update({
        where: { id },
        data: updateUserDto

      })
      return result
    }
    catch (error) {
      console.log(error)
      throw new InternalServerErrorException("updateDisplayName")
    }
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
    const user = await this.prisma.user.findUnique({ where: { displayName: friendName } })
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    else if (user.id == userId) throw new HttpException("Can't add yourself!", HttpStatus.FORBIDDEN)

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
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    else if (user.id == userId)
      throw new HttpException("Can't add yourself!", HttpStatus.FORBIDDEN)

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
  async getUserAvatarUrl(test: number) {
    return await this.prisma.userAvatar.findUnique({
      where: {
        id: test
      },
      select: {
        filename: true
      }
    })
  }

  async setUserStatus(userId: number, status: Status) {
    try {
      await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          currentStatus: status
        }
      })
    }
    catch (error) {
      console.log(error)
      throw new InternalServerErrorException("updateUserStatus")
    }
  }

}
