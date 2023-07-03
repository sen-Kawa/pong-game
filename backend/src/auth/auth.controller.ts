import { Controller, Post, Get, Req, Res, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import {Response} from 'express'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  @UseGuards(AuthGuard('local'))
  async login(@Req() req,@Res({passthrough:true}) res:Response) {
    const jwtToken = await this.authService.getToken(req.user);
    const secretData = {
      accessToken: jwtToken,
    }
    res.cookie('auth-cookie', secretData, {
      httpOnly: true,
      expires: new Date(new Date().getTime()+86409000),
    });
    return {msg:"success"};
  }

  @Get('user-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  userProfile(@Req() req){
    console.log(req.cookies);
    return req.user;
  }

}
