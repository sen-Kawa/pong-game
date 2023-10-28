import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { HttpException, InternalServerErrorException } from '@nestjs/common'
import prisma from 'src/prisma/__mocks__/prisma'
import { UpdateUserDto } from './dto/update-user.dto'

describe('Unit test for UsersService', () => {
  let service: UsersService
  const mockDtoUpdateUser = new UpdateUserDto()
  mockDtoUpdateUser.displayName = 'updateDisplayNameTest'
  jest.mock('src/prisma/prisma.service')
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService]
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile()

    service = module.get<UsersService>(UsersService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('findAllFriends should return list of friends', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'findMany')
    const mockFriendList = [
      {
        following: [
          { displayName: 'displayTest', userName: 'test', currentStatus: 'OFLLINE' },
          { displayName: 'displayTest2', userName: 'test2', currentStatus: 'ONLINE' }
        ]
      }
    ]
    const resultFriendList = [
      { displayName: 'displayTest', userName: 'test', currentStatus: 'OFLLINE' },
      { displayName: 'displayTest2', userName: 'test2', currentStatus: 'ONLINE' }
    ]
    prisma.user.findMany.mockResolvedValue(mockFriendList as any)
    const frindlist = await service.findAllFriends(1)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
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
    expect(frindlist).toStrictEqual(resultFriendList)
  })

  it('findAllFriends should return empty list if no friends', async () => {
    const spy = jest.spyOn(prisma.user, 'findMany')
    const mockFriendList = [{ following: [] }]
    const resultFriendList = []
    prisma.user.findMany.mockResolvedValue(mockFriendList as any)
    const frindlist = await service.findAllFriends(1)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
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
    expect(frindlist).toStrictEqual(resultFriendList)
  })

  it('findOne should return a user', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique')
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(resultUser as any)
    const user = await service.findOne(1)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      }
    })
    expect(user).toStrictEqual(resultUser)
  })

  it('updateDisplayName should return a user if valid displayName', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique')
    const spy2 = jest.spyOn(prisma.user, 'update')
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(null as any)
    prisma.user.update.mockResolvedValue({ ...resultUser, displayName: 'SecretName' } as any)
    const user = await service.updateDisplayName(1, { displayName: 'SecretName' })

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        displayName: 'SecretName'
      }
    })
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { displayName: 'SecretName' }
    })
    expect(user).toStrictEqual({ ...resultUser, displayName: 'SecretName' })
  })

  it('updateDisplayName should throw an error if name taken', async () => {
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(resultUser as any)

    expect(async () => {
      await service.updateDisplayName(1, mockDtoUpdateUser)
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.updateDisplayName(1, mockDtoUpdateUser)
    }).rejects.toThrow('DisplayName already taken')
  })

  it('updateDisplayName throws an error if update fails', async () => {
    prisma.user.findUnique.mockResolvedValue(null as any)
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('updateUserStatus')
    })

    expect(async () => {
      await service.updateDisplayName(2, mockDtoUpdateUser)
    }).rejects.toThrow('updateDisplayName')
  })

  it('setTwoFactorAuthenticationSecret should run update', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'update')
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.update.mockResolvedValue(resultUser as any)
    await service.setTwoFactorAuthenticationSecret('SuperSecretSecret', 2)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        twoFactorAuthenticationSecret: 'SuperSecretSecret'
      }
    })
  })

  it('addFriend should run update on valid user name', async () => {
    const spy = jest.spyOn(prisma.user, 'update')
    const spy2 = jest.spyOn(prisma.user, 'findUnique')
    const friendUser = {
      id: 3,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    prisma.user.update.mockResolvedValue({} as any)
    await service.addFriend(1, 'myFriendsName')
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith({ where: { displayName: 'myFriendsName' } })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      data: {
        following: {
          connect: {
            id: 3
          }
        }
      }
    })
  })

  it('addFriend should throw an error if adding yourself', async () => {
    const friendUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow("Can't add yourself!")
  })

  it('addFriend should throw an error if friend not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null as any)

    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow('User not found')
  })

  it('removeFriend should run update on valid user name', async () => {
    const spy = jest.spyOn(prisma.user, 'update')
    const spy2 = jest.spyOn(prisma.user, 'findUnique')
    const friendUser = {
      id: 3,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    prisma.user.update.mockResolvedValue({} as any)
    await service.removeFriend(1, 'myFriendsName')
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith({ where: { displayName: 'myFriendsName' } })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      data: {
        following: {
          disconnect: {
            id: 3
          }
        }
      }
    })
  })

  it('removeFriend should throw an error if removing yourself', async () => {
    const friendUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow("Can't have yourself as friend!")
  })

  it('removeFriend should throw an error if friend not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null as any)

    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow('User not found')
  })

  it('findUser should return a list of user', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'findMany')
    const findUser = [
      {
        displayName: 'displayTest',
        userName: 'test'
      },
      {
        displayName: 'displayTest2',
        userName: 'test2'
      }
    ]

    const mockFriendList = [
      {
        following: [
          { displayName: 'displayTest', userName: 'test', currentStatus: 'OFLLINE' },
          { displayName: 'displayTest2', userName: 'nofriend', currentStatus: 'ONLINE' }
        ]
      }
    ]

    const resultUser = [
      {
        displayName: 'displayTest',
        userName: 'test',
        usersFriend: true
      },
      {
        displayName: 'displayTest2',
        userName: 'test2',
        usersFriend: false
      }
    ]
    prisma.user.findMany.mockResolvedValueOnce(findUser as any)
    prisma.user.findMany.mockResolvedValueOnce(mockFriendList as any)
    const user = await service.findUser(1, 'displayT')

    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            userName: {
              startsWith: 'displayT',
              mode: 'insensitive'
            }
          },
          {
            displayName: {
              startsWith: 'displayT',
              mode: 'insensitive'
            }
          }
        ],
        NOT: [
          {
            id: 1
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
    expect(user).toStrictEqual(resultUser)
  })

  it('findUser should return a list of user even with no friends', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'findMany')
    const findUser = [
      {
        displayName: 'displayTest',
        userName: 'test'
      },
      {
        displayName: 'displayTest2',
        userName: 'test2'
      }
    ]
    const resultUser = [
      {
        displayName: 'displayTest',
        userName: 'test',
        usersFriend: false
      },
      {
        displayName: 'displayTest2',
        userName: 'test2',
        usersFriend: false
      }
    ]
    const mockFriendList = [{ following: [] }]
    prisma.user.findMany.mockResolvedValueOnce(findUser as any)
    prisma.user.findMany.mockResolvedValueOnce(mockFriendList as any)
    const user = await service.findUser(1, 'displayT')

    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            userName: {
              startsWith: 'displayT',
              mode: 'insensitive'
            }
          },
          {
            displayName: {
              startsWith: 'displayT',
              mode: 'insensitive'
            }
          }
        ],
        NOT: [
          {
            id: 1
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
    expect(user).toStrictEqual(resultUser)
  })

  it('findUser should return a empty list if no user is found', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'findMany')
    const resultUser = []

    const mockFriendList = [
      {
        following: [
          { displayName: 'displayTest', userName: 'test', currentStatus: 'OFLLINE' },
          { displayName: 'displayTest2', userName: 'nofriend', currentStatus: 'ONLINE' }
        ]
      }
    ]

    prisma.user.findMany.mockResolvedValueOnce(resultUser as any)
    prisma.user.findMany.mockResolvedValueOnce(mockFriendList as any)
    const user = await service.findUser(1, 'displayT')

    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            userName: {
              startsWith: 'displayT',
              mode: 'insensitive'
            }
          },
          {
            displayName: {
              startsWith: 'displayT',
              mode: 'insensitive'
            }
          }
        ],
        NOT: [
          {
            id: 1
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
    expect(user).toStrictEqual([])
  })

  // it('getUserAvatarUrl should return an url', async () => {
  //   // @ts-ignore
  //   const spy = jest.spyOn(prisma.userAvatar, 'findUnique')
  //   const resultUrl = {
  //     avatar: 'Test'
  //   }
  //   // @ts-ignore
  //   prisma.profile_pic.findUnique.mockResolvedValue(resultUrl as any)
  //   const url = await service.getUserAvatarUrl(2)

  //   expect(spy).toBeCalledTimes(1)
  //   expect(spy).toHaveBeenCalledWith({
  //     where: {
  //       id: 2
  //     },
  //     select: {
  //       filename: true
  //     }
  //   })
  //   expect(url).toStrictEqual(resultUrl)
  // })

  it('setUserStatus should run update', async () => {
    // @ts-ignore
    const spy = jest.spyOn(prisma.user, 'update')

    //prisma.userAvatar.findUnique.mockResolvedValue({} as any)
    await service.setUserStatus(2, 'ONLINE')

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 2
      },
      data: {
        currentStatus: 'ONLINE'
      }
    })
  })

  it('setUserStatus throws an error if update fails', async () => {
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('updateUserStatus')
    })

    expect(async () => {
      await service.setUserStatus(2, 'ONLINE')
    }).rejects.toThrow('updateUserStatus')
  })

  it('createUser should create a user', async () => {
    const newUser = {
      userName: 'test',
      displayName: 'displayTest',
      email: 'test@test.de',
      _json: {
        image: {
          versions: {
            small: 'smallTest'
          }
        }
      }
    }
    jest.spyOn(service, 'downloadProfil').mockReturnValue(null)
    // @ts-ignore
    prisma.user.create.mockResolvedValue({
      id: 1,
      name: newUser.userName,
      displayName: newUser.displayName,
      userName: newUser.userName,
      email: newUser.email,
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE'
    })
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE'
    }
    const user = await service.createUser(newUser)
    expect(user).toStrictEqual(resultUser)
  })
  // it('updateAvatar should create an Avatar entry and update the user', async () => {
  //   // @ts-ignore
  //   const spy = jest.spyOn(prisma.userAvatar, 'create')
  //   // @ts-ignore
  //   const spy2 = jest.spyOn(prisma.user, 'update')
  //   const resultAvatar = {
  //     id: 2,
  //     private: false,
  //     filename: 'TestUpdateAvatar.jpg'
  //   }
  //   const resultUser = {
  //     id: 2,
  //     name: 'test',
  //     displayName: 'displayTest',
  //     userName: 'test',
  //     email: 'test@test.de',
  //     activated2FA: false,
  //     twoFactorAuthenticationSecret: '',
  //     refreshToken: '',
  //     currentStatus: 'OFFLINE',
  //     avatarId: 2
  //   }
  //   // @ts-ignore
  //   prisma.userAvatar.create.mockResolvedValue(resultAvatar as any)
  //   prisma.user.update.mockResolvedValue(resultUser as any)
  //   await service.updateAvatar(2, resultAvatar.filename)

  //   expect(spy).toBeCalledTimes(1)
  //   expect(spy).toHaveBeenCalledWith({
  //     data: {
  //       filename: resultAvatar.filename
  //     }
  //   })
  //   expect(spy2).toBeCalledTimes(1)
  //   expect(spy2).toHaveBeenCalledWith({
  //     where: {
  //       id: 2
  //     },
  //     data: {
  //       avatarId: resultAvatar.id
  //     }
  //   })
  // })
  // it('updateAvatar throws an error if create Avatar fails', async () => {
  //   prisma.userAvatar.create.mockImplementation(() => {
  //     throw new InternalServerErrorException('updateAvatar')
  //   })

  //   expect(async () => {
  //     await service.updateAvatar(2, 'Test')
  //   }).rejects.toThrow('updateAvatar')
  // })

  // it('updateAvatar throws an error if update User fails', async () => {
  //   const resultAvatar = {
  //     id: 2,
  //     private: false,
  //     filename: 'TestUpdateAvatar.jpg'
  //   }
  //   prisma.userAvatar.create.mockResolvedValue(resultAvatar as any)
  //   prisma.user.update.mockImplementation(() => {
  //     throw new InternalServerErrorException('updateAvatar')
  //   })

  //   expect(async () => {
  //     await service.updateAvatar(2, 'Test')
  //   }).rejects.toThrow('updateAvatar')
  // })

  // it('getOtherAvatarUrl should return an avatar object with filename', async () => {
  //   // @ts-ignore
  //   const spy = jest.spyOn(prisma.user, 'findUnique')
  //   const resultUser = {
  //     avatar: {
  //       filename: 'TestgetOtherAvatarUrl'
  //     }
  //   }
  //   prisma.user.findUnique.mockResolvedValue(resultUser as any)
  //   const result = await service.getOtherAvatarUrl('TestOtherAvatar')

  //   expect(spy).toBeCalledTimes(1)
  //   expect(spy).toHaveBeenCalledWith({
  //     where: {
  //       displayName: 'TestOtherAvatar'
  //     },
  //     select: {
  //       avatar: {
  //         select: {
  //           filename: true
  //         }
  //       }
  //     }
  //   })
  //   expect(result).toStrictEqual(resultUser)
  // })
})
