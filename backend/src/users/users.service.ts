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

  async findUser(name: string) {
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
  downloadProfil(url: string, fileName: string): boolean {
    const dest = './files/' + fileName + '.jpg'
    const file = fs.createWriteStream(dest)
    https.get(url, function (res) {
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
    return true
  }

  async createUser(profile: any): Promise<any> {
    let avatar: any
    if (this.downloadProfil(profile._json.image.versions.small, profile.username)) {
      avatar = await this.prisma.userAvatar.create({
        data: {
          filename: profile.username + '.jpg'
        }
      })
    } else {
      avatar = { id: 1 }
    }

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
    return user
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
      console.log(error)
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
