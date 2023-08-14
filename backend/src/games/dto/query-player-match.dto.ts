import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayUnique, IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator'
import { QueryMatchDTO } from './query-match.dto'

export class QueryPlayerMatchDTO extends QueryMatchDTO {
  /**
   * List of player ids that should be present in the match.
   */
  @ApiProperty({
    name: 'players[]', // brackets are import for the format of the query params
    type: [Number],
    minItems: 1,
    maxItems: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @IsInt({ each: true })
  @ArrayUnique()
  readonly players?: number[]
}
