import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { CreateMatchDto } from './dto/create-match.dto'
import { QueryPersonalMatchDTO } from './dto/query-personal-match.dto'
import { QueryPlayerMatchDTO } from './dto/query-player-match.dto'
//import { QuerySingleMatchDTO } from './dto/query-single-match.dto'
import { UpdateMatchDto } from './dto/update-match.dto'
import { MatchEntity } from './entities/match.entity'
import { MatchService } from './match.service'

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
  @ApiCreatedResponse({ type: MatchEntity })
  @ApiNotFoundResponse({ description: 'gets send if one of the specified users does not exist' })
  async create(@Body() createMatchDto: CreateMatchDto) {
    try {
      const match = await this.matchService.create({
        players: {
          create: createMatchDto.playerIds.map((id) => ({
            playerId: id
          }))
        }
      })

      return match
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003')
        throw new NotFoundException('User not found')
      throw error
    }
  }

  @Post('join')
  joinMatch(@Req() request: any) {
    return this.matchService.join(request['body'].matchId, request.user.id)
  }

  @Get('current')
  currentMatch(@Req() request: any) {
    return this.matchService.isInMatch(request.user.id)
  }

  /**
   * Creates a new match with the current user already in it.
   * @param request contains the user that send the request.
   * @returns a detailed representation of the created match.
   */
  @Post('me')
  async createMatchForCurrentUser(@Req() request) {
    const match = await this.matchService.create({
      players: {
        create: { playerId: request.user.id }
      }
    })

    return match
  }

  @Post('invite')
  async invitePlayer(@Req() request, @Body() body) {
    if (
      this.matchService.isInMatch(request.user.id) ||
      this.matchService.isInMatch(body.playerId)
    ) {
      throw new HttpException('player already in match', HttpStatus.NOT_MODIFIED)
    }

    const matchId = await this.matchService.invite(body.playerId, request.user.id)

    return matchId
  }

  @Post('decline')
  async declineMatch(@Body() body, @Req() request) {
    return this.matchService.decline(body.matchId, request.user.id)
  }

  /**
   * Finds all matches.
   * The level of detail in the representation and the set of matches can be controlled with query parameters.
   * @param queryMatch
   * @returns
   */
  @Get()
  @ApiOkResponse({ type: MatchEntity, isArray: true })
  async findAll(@Query() queryMatch: QueryPlayerMatchDTO) {
    return this.matchService.findAll(queryMatch)
  }

  /**
   * Searches for all matches with the currently logged in user.
   * @param request
   * @returns all matches in which the current user is present
   */
  @Get('me')
  async findAllForCurrentUser(@Req() request, @Query() queryMatch: QueryPersonalMatchDTO) {
    return this.matchService.findAll({
      ...queryMatch,
      players: queryMatch.opponent ? [request.user.id, queryMatch.opponent] : [request.user.id]
    })
  }

  /**
   * Searches for all matches where the specified user participated.
   * @param playerId user id of the player to search for.
   * @param queryMatch additional options for what to include and filter for.
   * @returns
   */
  @Get('/player/:id')
  async findAllForUser(
    @Param('id', ParseIntPipe) playerId: number,
    @Query() queryMatch: QueryPersonalMatchDTO
  ) {
    return this.matchService.findAll({
      ...queryMatch,
      players: queryMatch.opponent ? [playerId, queryMatch.opponent] : [playerId]
    })
  }

  /**
   * Finds one match.
   * @param id id of the match to find.
   * @param queryMatch
   * @returns
   */
  @Get(':id')
  @ApiOkResponse({ type: MatchEntity })
  @ApiNotFoundResponse({ description: 'match does not exist' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MatchEntity> {
    try {
      return await this.matchService.findOne(id, {
        includeScores: false,
        includePlayers: true
      })
    } catch (error) {
      throw new NotFoundException('match does not exist')
    }
  }

  /**
   * Updates the match.
   * Useful for adding new players or reporting the result.
   * @param id
   * @param updateGameDto
   * @returns
   */
  @Patch(':id')
  @ApiOkResponse({ type: MatchEntity, description: 'returns the modified entity' })
  @ApiNoContentResponse({ description: 'not modified' })
  @ApiNotFoundResponse({ description: 'match does not exist' })
  @ApiConflictResponse({
    description:
      'A conflict arises when the match already has two players an another one should be added.'
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateGameDto: UpdateMatchDto) {
    // console.debug(`update match with id ${id} with`, { updateGameDto })
    if (updateGameDto.playerId === undefined && updateGameDto.scores === undefined)
      throw new HttpException('not modified', HttpStatus.NO_CONTENT)

    try {
      await this.matchService.findOne(id)
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

  /**
   * Deletes the match.
   * @param id
   * @returns
   */
  @Delete(':id')
  @ApiOkResponse({ type: MatchEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchService.remove(+id)
  }
}
