import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { FileDto } from './dto/file.dto'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
  ApiTags,
  ApiConsumes
} from '@nestjs/swagger'
import { UserEntity } from './entities/user.entity'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { FindUserDto } from './dto/find-user.dto'
import { FriendDto } from './dto/friend.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'

import { editFileName, imageFileFilter } from './utils/file-upload.utils'

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  async findAllFriends(@Req() req) {
    return this.usersService.findAllFriends(req.user.id)
  }

  @Post('find')
  @UseGuards(JwtAuthGuard)
  async findUser(@Body() userName: FindUserDto) {
    return this.usersService.findUser(userName.name)
  }

  @Post('addFriend')
  @UseGuards(JwtAuthGuard)
  async addFriend(@Req() req, @Body() name: FriendDto) {
    await this.usersService.addFriend(req.user.id, name.friendName)
  }

  @Delete('removeFriend')
  @UseGuards(JwtAuthGuard)
  async removeFriend(@Req() req, @Body() name: FriendDto) {
    await this.usersService.removeFriend(req.user.id, name.friendName)
  }

  @Patch('changeDisplay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  async update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return new UserEntity(await this.usersService.updateDisplayName(req.user.id, updateUserDto))
  }

  @Post('upload')
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
        filename: editFileName
      }),
      fileFilter: imageFileFilter
    })
  )
  async uploadedFile(@Body() data: FileDto, @UploadedFile() file: Express.Multer.File, @Req() req) {
    // const response = {
    //   originalname: file.originalname,
    //   filename: file.filename,
    // };
    // return response;
    console.log(file)
  }

  @Get('userImage')
  @UseGuards(JwtAuthGuard)
  async seeUploadedFile(@Req() req, @Res() res) {
    const image = await this.usersService.getUserAvatarUrl(req.user.avatarId)
    return res.sendFile(image.filename, { root: './files' })
  }

}
