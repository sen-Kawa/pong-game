import { Module } from '@nestjs/common';
import { ChatBlockingController } from './chat-blocking.controller';
import { ChatBlockingService } from './chat-blocking.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatBlockingController],
  providers: [ChatBlockingService]
})
export class ChatBlockingModule {}
