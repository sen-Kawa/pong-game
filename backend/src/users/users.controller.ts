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
  HttpCode
} from '@nestjs/common'
import { UsersService } from './users.service'
import { DisplayNameDto } from './dto/displayName.dto'
import { UpdateStatusDto } from './dto/updateStatus.dto'
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse
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
  @ApiForbiddenResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiOkResponse({
    description:
      'Database has been searched and result was returned as an Array, if noone is founds the array is empty',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          userName: { type: 'string', example: 'UserName' },
          displayName: { type: 'string', example: 'DisplayName' }
        }
      }
    }
  })
  @Get('friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllFriends(@Req() req) {
    return this.usersService.findAllFriends(req.user.id)
  }

  /**
   * Returns a list of the user where the userName or DisplayName starts with the
   */
  @ApiForbiddenResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiOkResponse({
    description:
      'Database has been searched and result was returned as an Array, if noone is founds the array is empty',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userName: { type: 'string', example: 'UserName' },
          displayName: { type: 'string', example: 'DisplayName' }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Search String needs to be atleast 3 Letters long' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'UserName' }
      }
    }
  })
  @Post('find')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  findUser(@Body() userName: FindUserDto) {
    return this.usersService.findUser(userName.name)
  }

  /**
   * adds an user based on the DisplayName as a friend
   * @param req UserId
   * @param name the DisplayName of the friend
   */
  @ApiForbiddenResponse({
    description: 'Unauthorized if user is not logged in or if trying to add yourself as friend'
  })
  @ApiBadRequestResponse({ description: 'Search String needs to be atleast 3 Letters long' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        friendName: { type: 'string', example: 'FriendName' }
      }
    }
  })
  @ApiOkResponse({
    description: 'added friend, doesnt matter if already had as friend or not'
  })
  @ApiNotFoundResponse({ description: 'No User with this displayName was found' })
  @Post('addFriend')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async addFriend(@Req() req, @Body() name: FriendDto) {
    await this.usersService.addFriend(req.user.id, name.friendName)
  }
  //TODO return value?
  @Delete('removeFriend')
  @UseGuards(JwtAuthGuard)
  async removeFriend(@Req() req, @Body() name: FriendDto) {
    await this.usersService.removeFriend(req.user.id, name.friendName)
  }

  @Patch('changeDisplay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async update(@Req() req, @Body() updateUserDto: DisplayNameDto) {
    return new UserEntity(await this.usersService.updateDisplayName(req.user.id, updateUserDto))
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
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
    await this.usersService.updateAvatar(req.user.id, file.filename)
  }

  @Get('userImage')
  @UseGuards(JwtAuthGuard)
  async seeUploadedFile(@Req() req, @Res() res) {
    const image = await this.usersService.getUserAvatarUrl(req.user.avatarId)
    return res.sendFile(image.filename, { root: './files' })
  }

  @Patch('changeStatus')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateStatus(@Req() req, @Body() updateUserDto: UpdateStatusDto) {
    await this.usersService.setUserStatus(req.user.id, updateUserDto.currentStatus)
  }
  //TODO success check displayname check?
  @Get('userImage/:displayName')
  @UseGuards(JwtAuthGuard)
  async seeUploadedFileOthers(@Param('displayName') displayName: string, @Res() res) {
    const image = await this.usersService.getOtherAvatarUrl(displayName)
    if (!image) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    return res.sendFile(image.avatar.filename, { root: './files' })
  }
}
