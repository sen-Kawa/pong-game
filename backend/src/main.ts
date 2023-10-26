import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
      // transform: true,
      // transformOptions: { enableImplicitConversion: true } // WE HAD A TALK ABOUT THE PITFALLS OF THIS APPROACH
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
    origin: [
      'http://localhost:8080',
      'https://sturdy-halibut-5px7jx47ggwh79vw-8080.app.github.dev'
    ],
    methods: 'GET, PUT, POST, PATCH, DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  })
  app.use(cookieParser())

  await app.listen(3000)
}
bootstrap()
