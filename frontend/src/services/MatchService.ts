import jwtInterceptor from '@/interceptor/jwtInterceptor'
import type { MatchDTO, MatchResult } from '@/types/match'
import { type AxiosResponse } from 'axios'

/**
 * Central Interface for talking to the Backend API endpoints for matches.
 */
export default class MatchService {
  private static BASE_PATH = '/match'

  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public async fetchData(path?: string, params?: URLSearchParams): Promise<MatchDTO[]> {
    // TODO: add parameters to change endpoint, query parameters, etc.

    const requestPath = this.baseUrl + MatchService.BASE_PATH + (path ?? '')
    try {
      const response: AxiosResponse = await jwtInterceptor.get(requestPath, {
        withCredentials: true,
        params: params
      })
      return response.data
    } catch (error) {
      console.error('Error fetching data from the backend:', error)
      throw error
    }
  }

  public async getMatchHistory(scope: Scope, playerId?: number): Promise<MatchResult[]> {
    let path: string = ''
    const params = new URLSearchParams()

    params.append('includeScores', 'true')
    params.append('includePlayers', 'true')
    params.append('completed', 'true')

    switch (scope) {
      case Scope.global:
        break
      case Scope.personal:
        path = '/me'
        break
      case Scope.user:
        path = '/player/' + playerId
        break
      case Scope.inProgress:
        throw new Error(`Scope ${Scope[scope]} not allowed in getMatchHistory`)

        break
      default:
        throw new Error(`Scope ${scope} not defined`)
        break
    }
    const data = await this.fetchData(path, params)
    return data.map(this.transformMatchDTOToResult)
  }

  public async getInProgressMatches(): Promise<MatchResult[]> {
    const params = new URLSearchParams()

    params.append('includeScores', 'false')
    params.append('includePlayers', 'true')
    params.append('started', 'true')
    params.append('completed', 'false')

    const data = await this.fetchData(undefined, params)
    return data.map(this.transformMatchDTOToResult)
  }

  public async createMatch() {
    const requestPath = this.baseUrl + MatchService.BASE_PATH + '/me'
    try {
      const response = await jwtInterceptor.post(
        requestPath,
        {},
        {
          withCredentials: true
        }
      )
      return response
    } catch (error) {
      console.error('Failed to create match for current player', error)
      throw error
    }
  }

  public async startMatch(matchId: number) {
    const requestPath = this.baseUrl + MatchService.BASE_PATH + '/' + matchId + '/start'
    try {
      const response = await jwtInterceptor.patch(
        requestPath,
        {},
        {
          withCredentials: true
        }
      )
      console.debug(response)
    } catch (error) {
      // TODO: handle error
    }
  }

  private transformMatchDTOToResult(dto: MatchDTO): MatchResult {
    const result: MatchResult = {
      id: dto.id,
      start: new Date(dto.start),
      end: dto.end ? new Date(dto.end) : undefined,
      players: dto.players?.map((player) => ({
        id: player.player.id,
        score: player.score,
        name: player.player.name,
        email: player.player.email
      }))
    }

    return result
  }
}

export enum Scope {
  global,
  personal,
  user, // view matches from somebody else
  inProgress
}
