import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator'
import { QueryMatchDTO } from './query-match.dto'

export class QueryPersonalMatchDTO extends QueryMatchDTO {
  @IsOptional()
  @IsNumber()
  @IsInt()
  @IsPositive()
  readonly opponent?: number
}
