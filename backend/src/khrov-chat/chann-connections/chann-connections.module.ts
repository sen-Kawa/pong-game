import { Module } from '@nestjs/common';
import { ChannConnectionsController } from './chann-connections.controller';
import { ChannConnectionsService } from './chann-connections.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChannConnectionsController],
  providers: [ChannConnectionsService]
})
export class ChannConnectionsModule {}
