import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter'
import * as session from 'express-session'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser')
const MemoryStore = require('memorystore')(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const config = new DocumentBuilder()
    .setTitle('ft_transcendence')
    .setDescription('The ft_transcendence API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:8080'],
    methods: 'GET, PUT, POST, PATCH, DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  })
  app.use(cookieParser())
  app.use(session({
    secret: 'my-super-secret',
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    resave: false,
    saveUninitialized: false
  }))
  await app.listen(3000)
}
bootstrap()
