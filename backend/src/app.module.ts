import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { SocketsModule } from './sockets/sockets.module'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate
    }),
    PrismaModule,
    UsersModule,
    GamesModule,
    AuthModule,
	SocketsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
