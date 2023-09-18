import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server } from 'socket.io'
import * as session from 'express-session'
import * as sharedsession from 'express-socket.io-session'
import { INestApplication } from '@nestjs/common'

/* eslint-disable */
const MemoryStore = require('memorystore')(session)

export class SessionAdapter extends IoAdapter {
  private app: INestApplication

  constructor(app: INestApplication) {
    super(app)
    this.app = app
  }

  createIOServer(port: number, options?: any) {
    const server: Server = super.createIOServer(port, options)
    // const configService: ConfigService = this.app.get(ConfigService);

    // FIXME: Use real secret here
    const sessionMiddleware = session({
      secret: 'my-super-secret',
      store: new MemoryStore({
        checkPeriod: 86400000
      }),
      resave: true,
      saveUninitialized: false
    })
    this.app.use(sessionMiddleware)
    server.use(
      sharedsession(sessionMiddleware, {
        autoSave: true
      })
    )
    return server
  }
}
