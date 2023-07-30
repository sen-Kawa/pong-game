import { Match } from '@prisma/client'
import { PlayersOnMatchWithUserInfo } from '../match.service'

export class MatchEntity implements Match {
  /**
   * Unique identifier for the match
   * @example 1
   */
  id: number
  /**
   * List of player on the match. Includes the score and user information about the player.
   */
  players: PlayersOnMatchWithUserInfo[]
  /**
   * Indicates match completion. If false the match is in progress or not yet started
   */
  completed: boolean
  start: Date
  end: Date
}
