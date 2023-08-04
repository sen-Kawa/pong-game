// TODO: add validation

import { IsBoolean, IsBooleanString, IsOptional, isBoolean, isBooleanString } from 'class-validator'

// TODO: use this in the controller
export class QueryMatchDTO {
  /**
   * Controls the inclusion of user information.
   * Undefined: include nothing, False: include Score, True: include Score and user information like name etc.
   */
  @IsBoolean()
  @IsOptional()
  readonly includePlayers?: boolean

  /**
   * If true searches for matches with a start date.
   */
  @IsBoolean()
  @IsOptional()
  readonly started?: boolean

  /**
   * If true searches for matches with an end date.
   */
  @IsBoolean()
  @IsOptional()
  readonly completed?: boolean
}
