import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from 'src/users/users.module'
import { ConfigModule } from '@nestjs/config'

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, JwtModule, UsersModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService]
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
