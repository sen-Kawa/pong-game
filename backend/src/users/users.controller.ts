import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
  StreamableFile
} from '@nestjs/common'
import { UsersService } from './users.service'
import { DisplayNameDto } from './dto/displayName.dto'
import { UpdateStatusDto } from './dto/updateStatus.dto'
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiPayloadTooLargeResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { UserEntity } from './entities/user.entity'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { FindUserDto } from './dto/find-user.dto'
import { FriendDto } from './dto/friend.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { multerOptions } from 'src/config/multer.config'

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Returns a list of the friends of the user
   */
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiOkResponse({
    description:
      'Database has been searched and result was returned as an Array, if noone is founds the array is empty',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userName: { type: 'string', example: 'UserName' },
          displayName: { type: 'string', example: 'DisplayName' },
          currentStatus: { type: 'object', example: 'OFFLINE' }
        }
      }
    }
  })
  @Get('friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  findAllFriends(@Req() req) {
    return this.usersService.findAllFriends(req.user.id)
  }

  /**
   * Returns a list of the user where the userName or DisplayName starts with the input Name
   */
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiOkResponse({
    description:
      'Database has been searched and result was returned as an Array, if noone is founds the array is empty',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userName: { type: 'string', example: 'UserName' },
          displayName: { type: 'string', example: 'DisplayName' },
          usersFriend: { type: 'boolean', example: 'true' }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Search String needs to be atleast 3 Letters long' })
  @ApiBody({
    type: FindUserDto
  })
  @Post('find')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  findUser(@Req() req, @Body() userName: FindUserDto) {
    return this.usersService.findUser(req.user.id, userName.name)
  }

  /**
   * adds an user based on the DisplayName as a friend
   * @param req UserId
   * @param name the DisplayName of the friend
   */
  @ApiForbiddenResponse({
    description: 'if trying to add yourself as friend'
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiBadRequestResponse({ description: 'Name String needs to be atleast 3 Letters long' })
  @ApiBody({
    type: FriendDto
  })
  @ApiOkResponse({
    description: 'added friend, doesnt matter if already had as friend or not'
  })
  @ApiNotFoundResponse({ description: 'No User with this displayName was found' })
  @Post('addFriend')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  async addFriend(@Req() req, @Body() name: FriendDto) {
    await this.usersService.addFriend(req.user.id, name.friendName)
  }

  /**
   * Removes a Friend based on the DisplayName
   * @param req UserId
   * @param name the display Name of the friend
   */
  @ApiForbiddenResponse({
    description: 'if trying to remove yourself as friend'
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiBadRequestResponse({ description: 'Name String needs to be atleast 3 Letters long' })
  @ApiBody({
    type: FriendDto
  })
  @ApiOkResponse({
    description: 'removed friend'
  })
  @ApiNotFoundResponse({ description: 'No User with this displayName was found' })
  @Delete('removeFriend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  async removeFriend(@Req() req, @Body() name: FriendDto) {
    await this.usersService.removeFriend(req.user.id, name.friendName)
  }
  /**
   * changes the Display of the User
   * @param req UserId
   * @param updateUserDto DisplayName
   * @returns UserEntity
   */
  @ApiForbiddenResponse({
    description: 'if the DisplayName is already taken'
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiBadRequestResponse({
    description:
      'Name String needs to be atleast 3 Letters long and only Contain the Letters: (a-z)(A-Z)'
  })
  @ApiBody({
    type: DisplayNameDto
  })
  @Patch('changeDisplay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  @ApiOkResponse({ description: 'Returns the User with the new DisplayName', type: UserEntity })
  async update(@Req() req, @Body() updateUserDto: DisplayNameDto) {
    return new UserEntity(await this.usersService.updateDisplayName(req.user.id, updateUserDto))
  }
  /**
   * upload a file that get used as Profil Picture
   * @param file a file
   * @param req UserId
   */
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiBadRequestResponse({
    description: 'File needs to be of type jpg,jpeg,png or gif'
  })
  @ApiPayloadTooLargeResponse({
    description: 'File needs to smaller then MAXSIZE'
  })
  @ApiCreatedResponse({
    description: 'File was uploaded and saved and is now the new Profile Picture'
  })
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadedFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new HttpException('missing file', HttpStatus.BAD_REQUEST)
    const imagedata = 'data:' + file.mimetype + ';base64,' + req.file.buffer.toString('base64')
    await this.usersService.updateAvatar(req.user.id, imagedata)
  }

  /**
   * Returns the User Profil Picture as stream
   * @param req USerID
   * @param res
   * @returns the User Profil Picture
   */
  @ApiOkResponse({
    description: 'Returns an image object of the Profil Picture'
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @Get('userImage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async seeUploadedFile(@Req() req, @Res({ passthrough: true }) res) {
    const image = await this.usersService.getUserAvatarUrl(req.user.id)
    const base64Image = image.avatar.split(';base64,').pop()
    const buffer = Buffer.from(base64Image, 'base64')
    return new StreamableFile(buffer)
  }

  /**
   * changes the currentStatus of a User, uses the Status enum
   * @param req UserId
   * @param updateUserDto the new status type: Status enum
   */
  @Patch('changeStatus')
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiOkResponse({
    description: 'If the Status is updated'
  })
  @ApiBadRequestResponse({
    description: 'currentStatus needs to be of type Status'
  })
  @ApiBody({
    type: UpdateStatusDto
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  async updateStatus(@Req() req, @Body() updateUserDto: UpdateStatusDto) {
    await this.usersService.setUserStatus(req.user.id, updateUserDto.currentStatus)
  }

  /**
   * Returns the Profil Picture of a another User
   * @param displayName the DisplayName of a User
   * @param res
   * @returns the User Profil Picture
   */
  @ApiOkResponse({
    description: 'Returns an image object of the Profil Picture'
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiNotFoundResponse({ description: 'No User with this displayName was found' })
  @Get('userImage/:displayName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  async seeUploadedFileOthers(
    @Param('displayName') displayName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Res({ passthrough: true }) res
  ) {
    const image = await this.usersService.getOtherAvatarUrl(displayName)
    if (!image) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    const base64Image = image.profile_pics[0].avatar.split(';base64,').pop()
    const buffer = Buffer.from(base64Image, 'base64')
    return new StreamableFile(buffer)
  }
}
