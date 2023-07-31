import type { MatchDTO, MatchResult } from '@/types/match'
import axios, { type AxiosResponse } from 'axios'

export default class MatchService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public async fetchData(): Promise<MatchDTO[]> {
    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/match?include-players=true`)
      console.debug(response)
      return response.data
    } catch (error) {
      console.error('Error fetching data from the backend:', error)
      throw error
    }
  }

  public async getMatchHistory(): Promise<MatchResult[]> {
    const data = await this.fetchData()
    return data.map(this.transformMatchDTOToResult)
  }

  private transformMatchDTOToResult(dto: MatchDTO): MatchResult {
    const result: MatchResult = {
      id: dto.id,
      completed: dto.completed,
      start: new Date(dto.start),
      end: new Date(dto.end),
      players: dto.players.map((player) => ({
        id: player.player.id,
        score: player.score,
        name: player.player.name,
        email: player.player.email
      }))
    }

    return result
  }
}
