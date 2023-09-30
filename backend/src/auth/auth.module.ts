import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { TwoFAStrategy } from './strategies/2fa.strategy'
import { FTStrategy } from './strategies/42.strategy'
import { RefreshTokenStrategy } from './strategies/refresh.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWTSECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION')
        }
      }),
      inject: [ConfigService]
    }),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TwoFAStrategy, FTStrategy, RefreshTokenStrategy],
  exports: [AuthService]
})
export class AuthModule {}
