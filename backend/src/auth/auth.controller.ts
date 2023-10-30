import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Response } from 'express'
import { TFAAuthGuard } from 'src/auth/guards/2fa-auth.guard'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RefreshAuthGuard } from 'src/auth/guards/refresh.guard'
import { UserEntity } from 'src/users/entities/user.entity'
import { AuthService } from './auth.service'

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

  /**
   * Redirect to the 42 login page
   */
  @Get('42login')
  @UseGuards(AuthGuard('42'))
  handleLogin() {}

  /**
   * callback from 42 login, setting up cookies and then redirect depending on:
   * New User (or not set displayName) : /user/firsttime,
   * Old user with 2fa activated: /user/2fa,
   * Old User without 2fa activated: '/user/Preference',
   * @param req
   * @param res
   */
  @Get('callback')
  @UseGuards(AuthGuard('42'))
  async handleCallback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
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
    await this.authService.updateRefreshToken(req.user.id, jwtRefreshToken)
    if (req.user.activated2FA) res.redirect(this.config.get<string>('FRONTEND_URL') + '/user/2fa')
    else {
      if (req.user.displayName)
        res.redirect(this.config.get<string>('FRONTEND_URL') + '/user/Preference')
      else res.redirect(this.config.get<string>('FRONTEND_URL') + '/user/firsttime')
    }
  }

  /**
   * Deactivated 2FA for the User
   * @param req UserId
   */
  @ApiOkResponse({ description: 'Deactivated the 2FA ' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @Get('deactivate2FA')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  deactivate2FA(@Req() req) {
    this.authService.deactivate2FA(req.user.id)
  }

  /**
   * First Step to Activate 2FA, save the secret for it in the Database and returns an Url for the QRCode
   * @param req
   * @returns An url to a QRCode for the Authenticator App
   */
  @ApiOkResponse({
    description: 'An url to a QRCode to scan for a Authenticator App',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @Get('activate2FA')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  async activate2FA(@Req() req) {
    const { otpauthUrl } = await this.authService.generate2FASecret(req.user)
    return { url: await this.authService.generateQrCodeDataURL(otpauthUrl) }
  }

  /**
   * Returns the User Profil of the User
   * @param req UserID
   * @returns the User Profile
   */
  @ApiOkResponse({ description: 'Returns the User Profil of a User', type: UserEntity })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @Get('user-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  userProfile(@Req() req) {
    return new UserEntity(req.user)
  }

  /**
   * Logs the User out, deleting access and refresh token, last one also from the database
   * @param req UserId
   * @param res
   * @returns a msg of Success
   */
  @ApiOkResponse({
    description: 'User is logged out',
    schema: {
      type: 'object',
      properties: {
        msg: { type: 'string' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @Get('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JwtAuthGuard')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth-cookie')
    res.clearCookie('refresh-cookie')
    this.authService.resetRefreshToken(req.user.id)
    return { msg: 'success' }
  }

  /**
   * Validates your Auth app and final activates 2fa
   * @param req UserId
   * @param code the number code from the auth app
   */
  @ApiOkResponse({ description: 'The Auth App is validated and 2FA is activated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized if user is not logged in' })
  @ApiForbiddenResponse({ description: 'The Code send could not be validated' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string'
        }
      }
    }
  })
  @HttpCode(200)
  @Post('verifyactivate2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async activate2fa(@Req() req, @Body('code') code: string) {
    const validCode = await this.authService.verify2FA(req.user.id, code)
    if (!validCode) {
      throw new HttpException('Code could not be Validated', HttpStatus.FORBIDDEN)
    }
    await this.authService.activate2FA(req.user.id)
  }

  /**
   * Final login endpoint if 2FA is activated
   * @param req UserId
   * @param code Auth app code
   * @param res
   * @returns atm the user id and that 2fa is enabled
   */
  @ApiOkResponse({ description: 'Log in with 2FA was successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized as User could not be verified' })
  @ApiForbiddenResponse({ description: 'The Code send could not be validated' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string'
        }
      }
    }
  })
  @Post('verify2FA')
  @HttpCode(200)
  @UseGuards(TFAAuthGuard)
  @ApiBearerAuth()
  async verify2FA(
    @Req() req,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const validCode = await this.authService.verify2FA(req.user.id, code)
    if (!validCode) {
      throw new HttpException('Code could not be Validated', HttpStatus.FORBIDDEN)
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
  }

  /**
   * Refreshing the Access Token with a valid Refresh-Token
   * @param req The Refresh-Token
   * @param res
   */
  @ApiOkResponse({ description: 'The Access Token was refreshed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized as User could not be verified' })
  @Get('refresh')
  @UseGuards(RefreshAuthGuard)
  async refreshTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh-cookie']
    if (!refreshToken) {
      throw new UnauthorizedException('No Valid RefreshToken')
    }
    const payload = this.jwtService.decode(refreshToken) as JwtPayload
    const { test, twoFactor } = await this.authService.verifyRefreshToken(
      payload.userId,
      refreshToken
    )
    if (test) {
      const jwtToken = this.authService.getAccessToken(payload.userId, twoFactor)
      res.cookie('auth-cookie', jwtToken, {
        httpOnly: true,
        expires: new Date(new Date().getTime() + 86409000)
      })
    } else {
      throw new UnauthorizedException('No Valid RefreshToken')
    }
  }

  //TODO fake login route for testing
  // comment out if needed
  //   @Post('login')
  //   async login(
  //     @Req() req: any,
  //     @Body('userid') userId: number,
  //     @Res({ passthrough: true }) res: Response
  //   ) {
  //     const jwtToken = this.authService.getAccessToken(+userId, false)
  //     res.cookie('auth-cookie', jwtToken, {
  //       httpOnly: true,
  //       expires: new Date(new Date().getTime() + 86409000)
  //     })
  //     const jwtRefreshToken = this.authService.getRefreshToken(+userId)
  //     res.cookie('refresh-cookie', jwtRefreshToken, {
  //       httpOnly: true,
  //       expires: new Date(new Date().getTime() + 86409000)
  //     })
  //     await this.authService.updateRefreshToken(+userId, jwtRefreshToken)
  //     return {
  //       userId: userId,
  //       twoFaEnabled: false
  //     }
  //   }
}
