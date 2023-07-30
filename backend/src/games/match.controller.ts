import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  ParseBoolPipe,
  Query,
  HttpException,
  HttpStatus,
  NotFoundException
} from '@nestjs/common'
import { MatchService } from './match.service'
import { CreateMatchDto } from './dto/create-match.dto'
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { MatchEntity } from './entities/match.entity'
import { UsersService } from 'src/users/users.service'
import { isInstance } from 'class-validator'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

@Controller('match')
@ApiTags('match')
export class MatchController {
  constructor(
    private readonly matchService: MatchService,
    private readonly usersService: UsersService
  ) {}

  /**
   * Creates a match entity.
   * @param createMatchDto contains the participating players
   * @returns the created match entity
   */
  @Post()
  @ApiCreatedResponse({ type: MatchEntity }) // TODO: include players in response example
  @ApiNotFoundResponse({ description: 'gets send if one of the specified users does not exist' })
  async create(@Body() createMatchDto: CreateMatchDto) {
    try {
      return await this.matchService.create({
        players: {
          create: createMatchDto.playerIds.map((id) => ({
            playerId: id
          }))
        }
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003')
        throw new NotFoundException('User not found') // TODO: maybe be more verbose: which user was not found?
      throw error
    }
  }

  @Get()
  @ApiOkResponse({ type: MatchEntity, isArray: true })
  findAll(
    @Query('include-players', new ParseBoolPipe({ optional: true })) includePlayers?: boolean
  ) {
    console.log(includePlayers)
    return this.matchService.findAll(includePlayers)
  }

  @Get(':id')
  @ApiOkResponse({ type: MatchEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.findOne(+id)
  }

  // @Patch(':id')
  // @ApiCreatedResponse({ type: MatchEntity })
  // update(@Param('id', ParseIntPipe) id: number, @Body() updateGameDto: UpdateGameDto) {
  //   return this.matchService.update(+id, updateGameDto)
  // }

  @Delete(':id')
  @ApiOkResponse({ type: MatchEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.remove(+id)
  }
}
