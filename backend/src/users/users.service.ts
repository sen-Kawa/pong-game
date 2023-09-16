import { Injectable, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Status } from '@prisma/client'
import * as https from 'https'
import * as fs from 'fs'

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

  //TODO error handling?
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
    const friendList = await this.findAllFriends(id)
    if (result.length) {
      result.forEach((user: any) => {
        user.usersFriend = friendList.some((friend) => friend.userName == user.userName)
      })
    }
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
    } catch (error) {
      throw new InternalServerErrorException('updateUserStatus')
    }
  }

  // async createUser(profile: any): Promise<any> {
  //   let avatar: any
  //   const url = profile._json.image.versions.small
  //   const dest = './files/' + profile.username + '.jpg'
  //   const file = fs.createWriteStream(dest)

  //   const req = https.get(url, function (res) {
  //     res.pipe(file)
  //     file
  //       .on('finish', function () {
  //         file.close()
  //         // call funcForCreateUser
  //       })
  //       .on('error', function () {
  //         fs.unlink(dest, (err) => {
  //           if (err) throw err
  //           console.log('path/file.txt was deleted')
  //         })
  //       })
  //   })
  // }

  //TODO fail on download handle / and tests?
  downloadProfil(url: string, fileName: string): string {
    const dest = './files/' + fileName + '.jpg'
    const file = fs.createWriteStream(dest)
    const req = https.get(url, function (res) {
      res.pipe(file)
      file
        .on('finish', function () {
          file.close()
        })
        .on('error', function () {
          fs.unlink(dest, (err) => {
            if (err) throw err
            console.log('path/file.txt was deleted')
          })
        })
    })
    req.end()
    return `data:image/gif;base64, ${fs.readFileSync(dest, { encoding: 'base64' })}`
  }

  async createUser(profile: any): Promise<any> {
    let avatar: any
    const userDp64 = this.downloadProfil(profile._json.image.versions.small, profile.username)
    const userDp =
      userDp64.length > 0
        ? userDp64
        : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC'
    if (userDp64.length > 0) {
      try {
        avatar = await this.prisma.userAvatar.create({
          data: {
            filename: profile.username + '.jpg'
          }
        })
      } catch (error) {
        avatar = { id: 1 }
      }
    } else {
      avatar = { id: 1 }
    }
    try {
      const user = await this.prisma.user.create({
        data: {
          displayName: profile.userName,
          name: profile.displayName,
          userName: profile.username,
          email: profile.email,
          activated2FA: false,
          avatarId: avatar.id
        }
      })
      await this.prisma.profile_pic.create({
        data: {
          userId: user.id,
          avatar: userDp
        }
      })
      return user
    } catch (error) {
      throw new InternalServerErrorException('createUser')
    }
  }

  async updateAvatar(id: number, fileName: string) {
    try {
      const avatar = await this.prisma.userAvatar.create({
        data: {
          filename: fileName
        }
      })
      await this.prisma.user.update({
        where: {
          id: id
        },
        data: {
          avatarId: avatar.id
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
        avatar: {
          select: {
            filename: true
          }
        }
      }
    })
  }
}
