import { Controller, Post, Get, Req, Res, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiCreatedResponse, ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entities/auth.entity';
import { PassEntity } from './entities/pass.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import {Response} from 'express'
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import {TFAAuthGuard} from './2fa-auth.guard'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(		
    private userService: UsersService,
		private jwtService: JwtService,
		private authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({ type: AuthEntity })
  @ApiBody({type: PassEntity })
  @UseGuards(AuthGuard('local'))
  async login(@Req() req,@Res({passthrough:true}) res:Response) {
      const jwtToken = this.authService.getToken(req.user.userId, false);
      // const secretData = {
      //   accessToken: jwtToken,
      // }
      res.cookie('auth-cookie', jwtToken, {
        httpOnly: true,
        expires: new Date(new Date().getTime()+86409000),
      });
    return {      userId: req.user.id,
      twoFaEnabled: req.user.activated2FA,};
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

  @Post('verifyactivate2fa')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async activate2fa(@Req() req, @Body('code') code: string)
  {
    const validCode = await this.authService.verify2FA(req.user.id, code);
    if (!validCode)
    {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.authService.activate2FA(req.user.id);

  }

  @Post('verify2FA')
  @UseGuards(AuthGuard('2fa'))
  @ApiBearerAuth()
  async verify2FA(@Req() req, @Body('code') code: string, @Res({passthrough:true}) res:Response)
  {
    const validCode = await this.authService.verify2FA(req.user.id, code);
    if (!validCode)
    {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const jwtToken = this.authService.getToken(req.user.id, true);
    res.cookie('auth-cookie', jwtToken, {
      httpOnly: true,
      expires: new Date(new Date().getTime()+86409000),
    });
  return {      userId: req.user.id,
    twoFaEnabled: req.user.activated2FA,};
  }
}
