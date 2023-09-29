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
    if (req && fs.existsSync(dest)) {
      try {
        const base64 = `data:image/gif;base64, ${fs.readFileSync(dest, { encoding: 'base64' })}`
        return base64
      } catch (error) {
        return ''
      }
    }
    return ''
  }

  async createAvatarId(name: string): Promise<number> {
    try {
      const avatar = await this.prisma.userAvatar.create({
        data: {
          filename: name
        },
        select: {
          id: true
        }
      })
      return avatar.id
    } catch (error) {
      return 1
    }
  }

  async createUser(profile: any): Promise<any> {
    const userDp64 = this.downloadProfil(profile._json.image.versions.small, profile.username)
    const avatarId = await this.createAvatarId(profile.username + '.jpg')
    try {
      const user = await this.prisma.user.create({
        data: {
          displayName: profile.userName,
          name: profile.displayName,
          userName: profile.username,
          email: profile.email,
          activated2FA: false,
          avatarId: avatarId
        }
      })
      if (userDp64 && userDp64.length === 0) {
        await this.prisma.profile_pic.create({ data: { userId: user.id } })
      } else {
        await this.prisma.profile_pic.create({
          data: {
            userId: user.id,
            avatar: userDp64
          }
        })
      }
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
