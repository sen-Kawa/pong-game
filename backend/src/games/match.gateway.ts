import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { SocketService } from "../socket/socket.service";
import { Server, Socket } from "socket.io"
import { Logger } from "@nestjs/common";
import { GameUpdate, MatchService } from "./match.service";


@WebSocketGateway({
	cors: {
	  origin: ['http://localhost:8080'],
	  credentials: true,
	},
	transports: ['websocket', 'polling'],
  })
export class AppGateway {
    constructor(private socketService: SocketService, private matchService: MatchService) {

    }


    @WebSocketServer() public server: Server;
    private logger: Logger = new Logger('AppGateWay');

	/**
	 *
	 * @param update
	 */
	@SubscribeMessage("move")
	game_update(@MessageBody() update: GameUpdate) {
        const match = this.matchService.matches[update.gameid];
	}
}