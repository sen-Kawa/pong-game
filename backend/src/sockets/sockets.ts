import { OnModuleInit, UseGuards } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { FTAuthGuard } from 'src/auth/guards/42.guards';
import { TFAAuthGuard } from 'src/auth/guards/2fa-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RefreshAuthGuard } from 'src/auth/guards/refresh.guard';
import { AuthGuard } from '@nestjs/passport';

@WebSocketGateway({
	cors: {
	  origin: ['http://localhost:8080'],
	  credentials: true,
	},
	transports: ['websocket', 'polling'],
  })
@UseGuards(JwtAuthGuard)
export class Sockets implements OnModuleInit {

	@WebSocketServer()
	server: Server

	onModuleInit() {
		this.server.on("connection", (socket) => {
			socket.emit("hello");
		})
	}

	@SubscribeMessage('send')
	reactSend() {
		console.log("got send");
		this.server.emit("test");
	}
}