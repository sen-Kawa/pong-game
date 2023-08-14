import { PickType } from '@nestjs/swagger'
import { QueryMatchDTO } from './query-match.dto'

export class QuerySingleMatchDTO extends PickType(QueryMatchDTO, [
  'includeScores',
  'includePlayers'
] as const) {}
