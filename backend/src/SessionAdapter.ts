import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, Socket } from "socket.io";
import * as session from 'express-session'
import * as sharedsession from 'express-socket.io-session'
import { INestApplication } from "@nestjs/common";
import { MessageMappingProperties } from "@nestjs/websockets";
import { Observable } from "rxjs";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const MemoryStore = require('memorystore')(session);

export class SessionAdapter extends IoAdapter {
    private app: INestApplication;

    constructor(app: INestApplication) {
        super(app);
        this.app = app;
    }

    createIOServer(port: number, options?: any) {
        const server: Server = super.createIOServer(port, options);
        // const configService: ConfigService = this.app.get(ConfigService);

        // FIXME: Use real secret here
        let sessionMiddleware = session({
            secret: 'my-super-secret',
            store: new MemoryStore({
                checkPeriod: 86400000
            }),
            resave: true,
            saveUninitialized: false
        })
        this.app.use(sessionMiddleware);
        server.use(sharedsession(sessionMiddleware, {
            autoSave: true
        }));
        return server;
    }

    bindMessageHandlers(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, handlers: MessageMappingProperties[], transform: (data: any) => Observable<any>): void {
        const data = super.bindMessageHandlers(socket, handlers, transform);
    }

    mapPayload(payload: unknown): { data: any; ack?: Function; } {
        const data = super.mapPayload(payload);
        console.log(payload)
        return data
    }
}