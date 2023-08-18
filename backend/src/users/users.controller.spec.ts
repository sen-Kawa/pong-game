import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserEntity } from '../users/entities/user.entity'
import httpMocks = require('node-mocks-http')
import { FindUserDto } from './dto/find-user.dto'
import { FriendDto } from './dto/friend.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Readable } from 'stream'
import { UpdateStatusDto } from './dto/updateStatus.dto'
import { Status } from '@prisma/client'
import { DisplayNameDto } from './dto/displayName.dto'
//TODO check return values? right type not value
describe('UsersController Unit Tests', () => {
  let userController: UsersController

  const mockRequest = httpMocks.createRequest()
  const mockResponse = httpMocks.createResponse()

  mockRequest.user = new UserEntity({ id: 1, avatarId: 2 })
  const mockDtoFindUser = new FindUserDto()
  mockDtoFindUser.name = 'FindUserTest'

  const mockDtoFriend = new FriendDto()
  mockDtoFriend.friendName = 'addFriendTest'

  const mockDtoDisplayNAme = new DisplayNameDto()
  mockDtoDisplayNAme.displayName = 'updateDisplayNameTest'

  const mockDtoFriendr = new FriendDto()
  mockDtoFriendr.friendName = 'removeFriendTest'

  const mockDtoStatus = new UpdateStatusDto()
  mockDtoStatus.currentStatus = 'ONLINE'

  const file: Express.Multer.File = {
    filename: 'AvatarUrlString',
    originalname: '',
    encoding: '',
    mimetype: '',
    size: 11,
    stream: new Readable(),
    destination: '',
    path: '',
    fieldname: '',
    buffer: Buffer.alloc(0)
  }

  const mockUser: UserEntity = {
    id: 1,
    displayName: 'Ulli',
    name: 'Ulli Rings',
    userName: 'hrings',
    email: 'test@gmx.de',
    activated2FA: false,
    currentStatus: 'OFFLINE',
    avatarId: 2,
    refreshToken: '',
    twoFactorAuthenticationSecret: ''
  }

  const friendResult = new UserEntity({ id: 1, userName: 'hrings', displayName: 'Ulli' })
  const findUserResult = new UserEntity({ userName: 'hrings', displayName: 'Ulli' })

  const mockUsersService = {
    findAllFriends: jest.fn().mockImplementation((userId: number) => {
      friendResult.id = userId
      return friendResult
    }),
    findUser: jest.fn().mockImplementation((name: string) => {
      findUserResult.name = name
      return findUserResult
    }),
    addFriend: jest.fn().mockImplementation((UserId: number, name: string) => {
      findUserResult.name = name
      findUserResult.id = UserId
      return findUserResult
    }),
    removeFriend: jest.fn().mockImplementation((UserId: number, name: string) => {
      findUserResult.name = name
      findUserResult.id = UserId
      return findUserResult
    }),
    updateDisplayName: jest.fn().mockImplementation((UserId: number, update: UpdateUserDto) => {
      findUserResult.id = UserId
      mockUser.displayName = update.displayName!
      return mockUser
    }),
    updateAvatar: jest.fn().mockImplementation((UserId: number, filename: string) => {
      findUserResult.id = UserId
      file.fieldname = filename
      return mockUser
    }),
    getUserAvatarUrl: jest.fn().mockImplementation((avatarId: number) => {
      findUserResult.avatarId = avatarId
      return { filename: 'AvatarUrlString' }
    }),
    setUserStatus: jest.fn().mockImplementation((id: number, status: Status) => {
      findUserResult.id = id
      findUserResult.currentStatus = status
    }),
    getOtherAvatarUrl: jest.fn().mockImplementation((displayName: string) => {
      return { avatar: { filename: displayName } }
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService]
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile()

    userController = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(userController).toBeDefined()
  })

  it('findAllFriends should be called and called with the right value', () => {
    const spy = jest.spyOn(mockUsersService, 'findAllFriends')
    expect(userController.findAllFriends(mockRequest)).toEqual(friendResult)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1)
  })

  it('findUser should be called and called with the right value', () => {
    const spy = jest.spyOn(mockUsersService, 'findUser')
    expect(userController.findUser(mockDtoFindUser)).toEqual(findUserResult)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('FindUserTest')
  })

  it('addFriend should be called and called with the right value', async () => {
    const spy = jest.spyOn(mockUsersService, 'addFriend')
    await userController.addFriend(mockRequest, mockDtoFriend)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1, 'addFriendTest')
  })

  it('removeFriend should be called and called with the right value', async () => {
    const spy = jest.spyOn(mockUsersService, 'removeFriend')
    await userController.removeFriend(mockRequest, mockDtoFriendr)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1, 'removeFriendTest')
  })

  it('update should be called and called with the right value', async () => {
    const spy = jest.spyOn(mockUsersService, 'updateDisplayName')
    await userController.update(mockRequest, mockDtoDisplayNAme)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1, mockDtoDisplayNAme)
  })

  it('uploadedFile should be called and called with the right value', async () => {
    const spy = jest.spyOn(mockUsersService, 'updateAvatar')
    await userController.uploadedFile(file, mockRequest)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1, 'AvatarUrlString')
  })

  it('seeUploadedFile should be called and called with the right value', async () => {
    mockResponse.sendFile = jest.fn().mockImplementation(() => 0)
    const spy = jest.spyOn(mockUsersService, 'getUserAvatarUrl')
    await userController.seeUploadedFile(mockRequest, mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('setUserStatus should be called and called with the right value', async () => {
    const spy = jest.spyOn(mockUsersService, 'setUserStatus')
    await userController.updateStatus(mockRequest, mockDtoStatus)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1, mockDtoStatus.currentStatus)
  })
  it('seeUploadedFileOthers should be called and called with the right value', async () => {
    const spy = jest.spyOn(mockUsersService, 'getOtherAvatarUrl')
    await userController.seeUploadedFileOthers('TestDisplayName', mockResponse)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('TestDisplayName')
  })
})
