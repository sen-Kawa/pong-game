import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator'
import { QueryMatchDTO } from './query-match.dto'

export class QueryPersonalMatchDTO extends QueryMatchDTO {
  /**
   * The id of a opponent user.
   * @example 1
   */
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly opponent?: number
}
