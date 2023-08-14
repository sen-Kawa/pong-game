import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNumber,
  IsPositive
} from 'class-validator'

export class CreateMatchDto {
  /**
   * A list of players n the match identified by their id
   * @example [42, 69]
   */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @IsPositive({ each: true })
  @IsInt({ each: true })
  @ArrayUnique()
  readonly playerIds: number[]

  // sideSelection?
  // spectators?
}
