import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Body,
  UseGuards,
  UnauthorizedException
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

//TODO token and cookie to much same code
export interface JwtPayload {
  userId: number
  iat: number
  exp: number
}

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private config: ConfigService
  ) {}

  @Get('42login')
  @UseGuards(AuthGuard('42'))
  handleLogin() {}

  //TODO change url to env var
  @Get('callback')
  @UseGuards(AuthGuard('42'))
  handleCallback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const jwtToken = this.authService.getAccessToken(req.user.id, false)
    res.cookie('auth-cookie', jwtToken, {
      httpOnly: true,
      expires: new Date(new Date().getTime() + 86409000)
    })
    const jwtRefreshToken = this.authService.getRefreshToken(req.user.id)
    res.cookie('refresh-cookie', jwtRefreshToken, {
      httpOnly: true,
      expires: new Date(new Date().getTime() + 86409000)
    })
    this.authService.updateRefreshToken(req.user.id, jwtRefreshToken)
    if (req.user.activated2FA) res.redirect(this.config.get<string>('FRONTEND_URL') + '/user/2fa')
    else {
      if (req.user.displayName)
        res.redirect(this.config.get<string>('FRONTEND_URL') + '/user/Preference')
      else res.redirect(this.config.get<string>('FRONTEND_URL') + '/user/firsttime')
    }
  }

  @Get('deactivate2FA')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  deactivate2FA(@Req() req) {
    this.authService.deactivate2FA(req.user.id)
  }

  @Get('activate2FA')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async activate2FA(@Req() req) {
    const { otpauthUrl } = await this.authService.generate2FASecret(req.user)
    return { url: await this.authService.generateQrCodeDataURL(otpauthUrl) }
  }

  @Get('user-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  userProfile(@Req() req) {
    return req.user
  }

  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth-cookie')
    res.clearCookie('refresh-cookie')
    this.authService.resetRefreshToken(req.user.id)
    return { msg: 'success' }
  }

  @Post('verifyactivate2fa')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async activate2fa(@Req() req, @Body('code') code: string) {
    const validCode = await this.authService.verify2FA(req.user.id, code)
    if (!validCode) {
      throw new UnauthorizedException('Wrong authentication code')
    }
    await this.authService.activate2FA(req.user.id)
  }

  @Post('verify2FA')
  @UseGuards(AuthGuard('2fa'))
  @ApiBearerAuth()
  async verify2FA(
    @Req() req,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const validCode = await this.authService.verify2FA(req.user.id, code)
    if (!validCode) {
      throw new UnauthorizedException('Wrong authentication code')
    }
    const jwtToken = this.authService.getAccessToken(req.user.id, true)
    res.cookie('auth-cookie', jwtToken, {
      httpOnly: true,
      expires: new Date(new Date().getTime() + 86409000)
    })
    const jwtRefreshToken = this.authService.getRefreshToken(req.user.id)
    res.cookie('refresh-cookie', jwtRefreshToken, {
      httpOnly: true,
      expires: new Date(new Date().getTime() + 86409000)
    })
    await this.authService.updateRefreshToken(req.user.id, jwtRefreshToken)
    return {
      userId: req.user.id,
      twoFaEnabled: req.user.activated2FA
    }
  }

  //TODO check if refresh token valid?
  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh-cookie']
    if (!refreshToken) {
      throw new UnauthorizedException()
    }
    const payload = this.jwtService.decode(refreshToken) as JwtPayload
    const test = await this.authService.verifyRefreshToken(payload.userId, refreshToken)
    if (test) {
      const jwtToken = this.authService.getAccessToken(payload.userId, false)
      res.cookie('auth-cookie', jwtToken, {
        httpOnly: true,
        expires: new Date(new Date().getTime() + 86409000)
      })
    } else {
      throw new UnauthorizedException()
    }
  }
}
