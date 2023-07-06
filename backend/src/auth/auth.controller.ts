import { Controller, Post, Get, Req, Res, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import {Response} from 'express'
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(		
    private userService: UsersService,
		private jwtService: JwtService,
		private authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  @UseGuards(AuthGuard('local'))
  async login(@Req() req,@Res({passthrough:true}) res:Response) {
    const jwtToken = this.authService.getToken(req.user);
    const secretData = {
      accessToken: jwtToken,
    }
    res.cookie('auth-cookie', secretData, {
      httpOnly: true,
      expires: new Date(new Date().getTime()+86409000),
    });
    return {msg:"success"};
  }

  @Get('deactivate2FA')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  deactivate2FA(@Req() req)
  {
    this.authService.deactivate2FA(req.user.id);

  }

  @Get('activate2FA')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async activate2FA(@Req() req, @Res({passthrough:true}) res:Response)
  {
    const { otpauthUrl } =
      await this.authService.generate2FASecret(
        req.user,
      );
      return {url :await this.authService.generateQrCodeDataURL(otpauthUrl)};
  }

  @Get('user-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  userProfile(@Req() req){
    return req.user;
  }


  @Get('logout')
  @ApiBearerAuth()
  async logout(@Res({passthrough:true}) res:Response){
    res.clearCookie('auth-cookie');
    return {msg:"success"};
  }

  @Post('verify2FA')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async verify2FA(@Req() req, @Body('code') code: string)
  {
    const validCode = await this.authService.verify2FA(req.user.id, code);
    if (!validCode)
    {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.authService.activate2FA(req.user.id);

  }
}
