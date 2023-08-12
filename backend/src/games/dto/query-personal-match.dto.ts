import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator'
import { QueryMatchDTO } from './query-match.dto'

export class QueryPersonalMatchDTO extends QueryMatchDTO {
  /**
   * The id of a user you played against.
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly opponent?: number
}
