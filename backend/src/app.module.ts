import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { GamesModule } from './games/games.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { validate } from './config/env.validation'
import { MulterModule } from '@nestjs/platform-express'
import { SocketModule } from './socket/socket.module'
import { AppGateway } from './app.gateway'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate
    }),
    MulterModule.register({
      dest: './files'
    }),

    PrismaModule,
    UsersModule,
    GamesModule,
    AuthModule,
	SocketModule,
    AppGateway
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
