import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  ParseBoolPipe,
  Query
} from '@nestjs/common'
import { MatchService } from './match.service'
import { CreateMatchDto } from './dto/create-match.dto'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { MatchEntity } from './entities/match.entity'

@Controller('match')
@ApiTags('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // TODO: include players in response
  @Post()
  @ApiCreatedResponse({ type: MatchEntity })
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchService.create({
      players: {
        create: createMatchDto.playerIds.map((id) => ({
          playerId: id
        }))
      }
    })
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
