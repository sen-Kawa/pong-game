// TODO: add validation

import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive
} from 'class-validator'
import { ToBoolean } from 'src/custom-validators/ToBoolean'

// TODO: use this in the controller
export class QueryMatchDTO {
  /**
   * Controls the inclusion of the scores.
   * @example true
   */
  @IsBoolean()
  @ToBoolean()
  readonly includeScores: boolean
  /**
   * Controls the inclusion of user information.
   * If true will include the scores regardless of the value set in includeScores.
   * @see includeScores
   * @example true
   */
  @IsBoolean()
  @ToBoolean()
  readonly includePlayers: boolean

  /**
   * If true searches for matches with a start date.
   */
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly started?: boolean

  /**
   * If true searches for matches with an end date.
   */
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly completed?: boolean

  /**
   * Find matches in which these players are.
   */
  // @ApiProperty({
  //   name: 'players[]',
  //   isArray: true,
  //   type: [Number]
  // })
  // @IsOptional()
  // @IsArray()
  // @ArrayMinSize(1)
  // @ArrayMaxSize(2)
  // @Type(() => Number)
  // @IsNumber({}, { each: true })
  // @IsPositive({ each: true })
  // @IsInt({ each: true })
  // @ArrayUnique()
  // readonly players?: number[]
}
