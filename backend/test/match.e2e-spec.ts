import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from 'src/app.module'

describe('MatchController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
  })

  it('/POST match', () => {
    return request(app.getHttpServer())
      .post('/match')
      .send({ playerIds: [1, 2] })
      .expect(201)
  })

  describe('invalid player ids', () => {
    it('negative', () => {
      return request(app.getHttpServer())
        .post('/match')
        .send({ playerIds: [1, -42] })
        .expect(400)
    })
  })
})
