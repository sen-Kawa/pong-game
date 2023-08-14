import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested
} from 'class-validator'

class Score {
  /**
   * Identifies the player.
   * Mainly added to avoid confusion about who scored what amount of points.
   * @example 1
   */
  @IsNumber()
  @IsPositive()
  @IsInt()
  readonly playerId: number

  /**
   * The players score/points.
   * @example 7
   */
  @IsNumber()
  @IsPositive()
  @IsInt()
  readonly score: number
}

export class UpdateMatchDto {
  /**
   * Id of the player to add to the Match
   * @example 2
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @IsInt()
  readonly playerId?: number

  /**
   * List of scores.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => Score)
  readonly scores?: Score[]
}
