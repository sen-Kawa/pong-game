import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}
  create(createGameDto: CreateGameDto) {
    return this.prisma.match.create({ data: createGameDto });
  }

  findAll() {
    return this.prisma.match.findMany();
  }

  findOne(id: number) {
    return this.prisma.match.findUnique({ where: { id } });
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return this.prisma.match.update({ where: { id }, data: updateGameDto });
  }

  remove(id: number) {
    return this.prisma.match.delete({ where: { id } });
  }
}
