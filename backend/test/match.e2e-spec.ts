import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from 'src/app.module'

describe('MatchController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
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
    it.each([
      { playerIds: [] },
      { playerIds: [0] },
      { playerIds: [-1] },
      { playerIds: [1, 2, 3] },
      { playerIds: [1.2] },
      { playerIds: [1, 1] }
    ])('should not accept request', (playerIds) => {
      return request(app.getHttpServer()).post('/match').send({ playerIds }).expect(400)
    })

    it('should not create match for non existing players', () => {
      return request(app.getHttpServer())
        .post('/match')
        .send({ playerIds: [42424242] })
        .expect(404)
    })
  })

  describe('/GET match', () => {
    it('should return all matches', () => {
      // TODO: check the content of the response?
      return request(app.getHttpServer()).get('/match').expect(200)
    })

    it('should return a single match', async () => {
      const match = await request(app.getHttpServer()).get('/match/1')
      expect(match.status).toEqual(200)
      expect(match.body).toBeDefined()
      expect(match.body.players).toBeTruthy()
    })

    it('should not find a single match that does not exist', () => {
      return request(app.getHttpServer()).get('/match/42424242').expect(404)
    })
  })
})
