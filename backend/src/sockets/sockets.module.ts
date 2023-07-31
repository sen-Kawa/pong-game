import { Module } from '@nestjs/common';
import { Sockets } from './sockets'

@Module({
	providers: [Sockets]
})
export class SocketsModule {}