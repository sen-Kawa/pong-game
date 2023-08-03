import type { MatchDTO, MatchResult } from '@/types/match'
import axios, { type AxiosResponse } from 'axios'

export default class MatchService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public async fetchData(path: string, params?: URLSearchParams): Promise<MatchDTO[]> {
    // TODO: add parameters to change endpoint, query parameters, etc.

    try {
      const response: AxiosResponse = await axios.get(this.baseUrl + path, {
        withCredentials: true,
        params: params
      })
      console.debug(response)
      return response.data
    } catch (error) {
      console.error('Error fetching data from the backend:', error)
      throw error
    }
  }

  public async getMatchHistory(scope: Scope, playerId?: number): Promise<MatchResult[]> {
    let path: string
    const params = new URLSearchParams()

    params.append('include-player', 'true')
    params.append('completed', 'true')

    switch (scope) {
      case Scope.global:
        path = '/match'
        break
      case Scope.personal:
        path = '/match/me'
        break
      case Scope.user:
        path = '/match/player/' + playerId
        break
      default:
        throw new Error(`Scope ${scope} not defined`)
        break
    }
    const data = await this.fetchData(path, params)
    return data.map(this.transformMatchDTOToResult)
  }

  private transformMatchDTOToResult(dto: MatchDTO): MatchResult {
    const result: MatchResult = {
      id: dto.id,
      start: new Date(dto.start),
      end: new Date(dto.end),
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
  user // view matches from somebody else
}
