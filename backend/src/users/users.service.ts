import { Injectable, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Status } from '@prisma/client'
import axios from 'axios'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllFriends(id: number) {
    const result = await this.prisma.user.findMany({
      where: {
        id: id
      },
      select: {
        following: {
          select: {
            userName: true,
            displayName: true,
            currentStatus: true
          }
        }
      }
    })
    return result[0].following
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async updateDisplayName(id: number, updateUserDto: UpdateUserDto) {
    const test = await this.prisma.user.findUnique({
      where: {
        displayName: updateUserDto.displayName
      }
    })
    if (test) throw new HttpException('DisplayName already taken', HttpStatus.FORBIDDEN)
    try {
      const result = this.prisma.user.update({
        where: { id },
        data: updateUserDto
      })
      return result
    } catch (error) {
      throw new InternalServerErrorException('updateDisplayName')
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorAuthenticationSecret: secret
      }
    })
  }

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
    const user = await this.prisma.user.findUnique({ where: { displayName: friendName } })
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    else if (user.id == userId)
      throw new HttpException("Can't have yourself as friend!", HttpStatus.FORBIDDEN)

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

  async findUser(id: number, name: string) {
    const result = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            userName: {
              startsWith: name,
              mode: 'insensitive'
            }
          },
          {
            displayName: {
              startsWith: name,
              mode: 'insensitive'
            }
          }
        ],
        NOT: [
          {
            id: id
          },
          {
            displayName: null
          }
        ]
      },
      select: {
        userName: true,
        displayName: true
      }
    })
    const friendList = await this.findAllFriends(id)
    if (result.length) {
      result.forEach((user: any) => {
        user.usersFriend = friendList.some((friend) => friend.userName == user.userName)
      })
    }
    return result
  }

  async getUserAvatarUrl(test: number) {
    return await this.prisma.profile_pic.findUnique({
      where: {
        userId: test
      },
      select: {
        avatar: true
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
    } catch (error) {
      throw new InternalServerErrorException('updateUserStatus')
    }
  }

  async downloadProfil(url: string, id: number) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      })
      const avatarData =
        'data:image/jpg;base64,' + Buffer.from(response.data, 'binary').toString('base64')
      await this.prisma.profile_pic.create({
        data: {
          userId: id,
          avatar: avatarData
        }
      })
    } catch (error) {
      await this.prisma.profile_pic.create({
        data: {
          userId: id
        }
      })
    }
    return true
  }

  async createUser(profile: any): Promise<any> {
    try {
      const user = await this.prisma.user.create({
        data: {
          displayName: null,
          name: profile.displayName,
          userName: profile.username,
          email: profile.email,
          activated2FA: false
        }
      })
      this.downloadProfil(profile._json.image.versions.small, user.id)
      return user
    } catch (error) {
      throw new InternalServerErrorException('createUser')
    }
  }

  async updateAvatar(id: number, fileName: string) {
    try {
      await this.prisma.profile_pic.update({
        where: { userId: id },
        data: {
          avatar: fileName
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('updateAvatar')
    }
  }

  async getOtherAvatarUrl(name: string) {
    return await this.prisma.user.findUnique({
      where: {
        displayName: name
      },
      select: {
        profile_pics: {
          select: {
            avatar: true
          }
        }
      }
    })
  }

  async updateWinLosses(winner: number, loser: number) {
    const winnerUser = await this.prisma.user.findUnique({
      where: {
        id: winner
      },
      select: {
        wins: true,
        losses: true
      }
    })

    const wins = winnerUser.wins + 1
    let ratio = wins / (wins + winnerUser.losses)
    await this.prisma.user.update({
      where: {
        id: winner
      },
      data: {
        wins: wins,
        ratio: ratio
      }
    })
    const loserUser = await this.prisma.user.findUnique({
      where: {
        id: loser
      },
      select: {
        wins: true,
        losses: true
      }
    })

    const losses = loserUser.losses + 1
    ratio = loserUser.wins / (losses + loserUser.wins)
    await this.prisma.user.update({
      where: {
        id: loser
      },
      data: {
        losses: losses,
        ratio: ratio
      }
    })
  }
}
