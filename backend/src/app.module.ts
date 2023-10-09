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
import { StatisticsModule } from './statistics/statistics.module'
import { ChatsModule } from './khrov-chat/chats/chats.module'
import { ChannelsModule } from './khrov-chat/channels/channels.module'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'env-sample'],
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
    StatisticsModule,
    ChatsModule,
    ChannelsModule
  ],
  controllers: [],
  providers: [AppGateway, AppService]
})
export class AppModule {}
