import { Match, PlayersOnMatch } from '@prisma/client'
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
  players: PlayersOnMatchWithUserInfo[] | PlayersOnMatch[] | undefined
  start: Date
  /**
   * Indicates time of match completion. If null the match is in progress or not yet started
   */
  end: Date
}
