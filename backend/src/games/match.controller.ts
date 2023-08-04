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
  NotFoundException,
  Patch,
  ConflictException,
  UseGuards,
  Req
} from '@nestjs/common'
import { MatchService } from './match.service'
import { CreateMatchDto } from './dto/create-match.dto'
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger'
import { MatchEntity } from './entities/match.entity'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { UpdateMatchDto } from './dto/update-match.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { QueryMatchDTO } from './dto/query-match.dto'

@Controller('match')
@ApiTags('match')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

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

  /**
   * Finds all matches.
   * The level of detail in the representation and the set of matches can be controlled with query parameters.
   * @param queryMatch
   * @returns
   */
  @Get()
  @ApiOkResponse({ type: MatchEntity, isArray: true })
  async findAll(@Query() queryMatch: QueryMatchDTO) {
    const { includePlayers, started, completed } = queryMatch
    if (includePlayers === undefined && started === undefined && completed === undefined)
      return this.matchService.all()
    return this.matchService.findAll({ includePlayers, started, completed })
  }

  /**
   * Searches for all matches with the currently logged in user.
   * @param request
   * @returns all matches in which the current user is present
   */
  @Get('me')
  async findAllForCurrentUser(@Req() request, @Query() queryMatch: QueryMatchDTO) {
    const { includePlayers, started, completed } = queryMatch
    console.debug(`Find matches for current User '${request.user}'`)
    return this.matchService.findAll({
      includePlayers,
      completed,
      started,
      player: request.user.id
    })
  }

  // TODO: add route for getting a players matches by name

  @Get('/player/:id')
  async findAllForUser(
    @Param('id', ParseIntPipe) playerId: number,
    @Query() queryMatch: QueryMatchDTO
  ) {
    const { includePlayers, started, completed } = queryMatch
    console.debug(`Find matches for User '${playerId}'`)
    return this.matchService.findAll({ includePlayers, completed, started, player: playerId })
  }

  @Get(':id')
  @ApiOkResponse({ type: MatchEntity })
  @ApiNotFoundResponse({ description: 'match does not exist' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MatchEntity> {
    try {
      return await this.matchService.findOne(+id)
    } catch (error) {
      throw new NotFoundException('match does not exist')
    }
  }

  @Patch(':id')
  @ApiOkResponse({ type: MatchEntity, description: 'returns the modified entity' })
  @ApiNoContentResponse({ description: 'not modified' })
  @ApiNotFoundResponse({ description: 'match does not exist' })
  @ApiConflictResponse({
    description:
      'A conflict arises when the match already has two players an another one should be added.'
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateGameDto: UpdateMatchDto) {
    if (updateGameDto.playerId === undefined && updateGameDto.scores === undefined)
      throw new HttpException('not modified', HttpStatus.NO_CONTENT) // TODO: NOT MODIFIED is 304

    try {
      await this.matchService.findOne(+id)
    } catch (error) {
      throw new NotFoundException('match does not exist')
    }
    let entity = null
    if (updateGameDto.playerId !== undefined) {
      try {
        entity = await this.matchService.addPlayer(id, updateGameDto.playerId)
      } catch (error) {
        if (error instanceof ConflictException) throw error
        throw new NotFoundException(
          'Error while trying to add player. Check if the player exits you are trying to add.'
        )
      }
    }
    if (updateGameDto.scores !== undefined) {
      entity = this.matchService.addMatchResult(id, updateGameDto.scores)
    }
    return entity
  }

  @Delete(':id')
  @ApiOkResponse({ type: MatchEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.remove(+id)
  }
}
