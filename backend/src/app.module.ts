import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { GamesModule } from './games/games.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { validate } from './config/env.validation'
import { MulterModule } from '@nestjs/platform-express'
import { ChatConnectionsModule } from './khrov-chat/chat-connections/chat-connections.module';
import { ChatHistoryModule } from './khrov-chat/chat-history/chat-history.module';
import { ChatBlockingModule } from './khrov-chat/chat_blocking/chat-blocking.module';
import { SearchUsersModule } from './khrov-chat/search-users/search-users.module';
import { ChannelsModule } from './khrov-chat/channels/channels.module';
import { ChannConnectionsModule } from './khrov-chat/chann-connections/chann-connections.module';
import { ChannModerationModule } from './khrov-chat/chann-moderation/chann-moderation.module';

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
    ChatConnectionsModule, 
    ChatHistoryModule, 
    ChatBlockingModule, 
    SearchUsersModule,
    ChannelsModule,
    ChannConnectionsModule,
    ChannModerationModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
