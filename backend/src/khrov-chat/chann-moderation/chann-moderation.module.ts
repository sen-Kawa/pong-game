import { Module } from '@nestjs/common';
import { ChannModerationController } from './chann-moderation.controller';
import { ChannModerationService } from './chann-moderation.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChannModerationController],
  providers: [ChannModerationService]
})
export class ChannModerationModule {}
