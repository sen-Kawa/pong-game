import { ApiProperty } from '@nestjs/swagger'
import { Match, PlayersOnMatch } from '@prisma/client'

export class MatchEntity implements Match {
  @ApiProperty()
  id: number

  @ApiProperty()
  players: PlayersOnMatch

  @ApiProperty()
  completed: boolean

  @ApiProperty()
  start: Date

  @ApiProperty()
  end: Date
}
