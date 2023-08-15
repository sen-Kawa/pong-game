import { IsBoolean, IsOptional } from 'class-validator'
import { ToBoolean } from 'src/custom-validators/ToBoolean'

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
}
