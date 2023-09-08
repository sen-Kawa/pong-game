import { IsBoolean, IsEnum, IsOptional } from 'class-validator'
import { ToBoolean } from 'src/custom-validators/ToBoolean'

export enum GameStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

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

  @IsEnum(GameStatus)
  @IsOptional()
  readonly gameStatus?: GameStatus
}
