import jwtInterceptor from '@/interceptor/jwtInterceptor'
import usePagination from '@/stores/usePagination'
import type { MatchDTO, MatchMetaData } from '@/types/match'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const baseUrlMatch = `${import.meta.env.VITE_BACKEND_SERVER_URI}/match`

export enum Scope {
  global,
  personal
}

enum GameStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

interface Filter {
  gameStatus: GameStatus
  includePlayers: boolean
  includeScores: boolean
}

export const useMatchStore = defineStore('match', () => {
  // ref becomes state
  const matches = ref<MatchMetaData[]>([])
  const currentMatch = ref<MatchMetaData>()
  const pageSize = ref(5)
  const loading = ref(false)
  const error = ref('')
  const player_number = ref(0)

  const filters = ref<Filter>({
    gameStatus: GameStatus.CREATED,
    includePlayers: true,
    includeScores: true
  })

  const currentLeftPlayer = ref("unknownLeftPlayer")
  const currentRightPlayer = ref("unknownRightPlayer")

  // computed becomes getter
  const matchCount = computed(() => matches.value.length)
  const pagination = computed(() => usePagination(matches, pageSize))
  const gameStates = computed(() => Object.values(GameStatus))
  const getLeftPlayer = computed(() => currentLeftPlayer.value)
  const getRightPlayer = computed(() => currentRightPlayer.value)


  // function becomes action
  function init() {
    matches.value = []
    currentMatch.value = undefined
    pageSize.value = 5
    loading.value = false
    error.value = ''
  }

  async function createMatch() {
    const requestPath = baseUrlMatch + '/me'

    if (currentMatch.value) {
      const message = 'match is already created'
      error.value = message
      throw new Error(message)
    }
    try {
      loading.value = true
      const response = await jwtInterceptor.post(
        requestPath,
        {},
        {
          withCredentials: true
        }
      )

      error.value = ''
      loading.value = false
      if (response.status != 201) {
        throw new Error(response.statusText)
      }
      const newMatch = transformMatchDTO(response.data)
      currentLeftPlayer.value = newMatch.players[0].name
      if(!newMatch.players[1]) {
        currentRightPlayer.value = "pending ..."
      }
      matches.value.push(newMatch)
      currentMatch.value = newMatch
      player_number.value = 0
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error'
      error.value = message
      console.error('Failed to create match for current player', e)
      throw error
    }
  }

  async function joinMatch(id: number) {
   // console.log('joinMatch called:', id)
    const requestPath = baseUrlMatch + '/join'
    // console.log("Join cM 1: ", currentMatch.value)

    if (currentMatch.value) {
      const message = 'already in game'
      error.value = message
      return;
      // throw new Error(message)
    }
    try {
      loading.value = true
      const response = await jwtInterceptor.post(
        requestPath,
        { matchId: id },  // match id was not transferred correctly before
        { withCredentials: true }
      )
      error.value = ''
      loading.value = false
      if (response.status != 201) {
        throw new Error(response.statusText)
      }
      const newMatch = transformMatchDTO(response.data as MatchDTO)
      currentLeftPlayer.value = newMatch.players[0].name
      if (newMatch.players[1])
        currentRightPlayer.value = newMatch.players[1].name
      else
        currentRightPlayer.value = 'pending ...'
      // console.log("currentPlayers", currentLeftPlayer, ": ", currentRightPlayer)
      currentMatch.value = newMatch
      player_number.value = 1
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error'
      error.value = message
      console.error('Failed to join match ' + id, e)
      //throw error
    }
  }

  async function getMatches(path?: string) {
    const requestPath = baseUrlMatch + (path ?? '')
    const searchParams = new URLSearchParams()

    try {
      loading.value = true

      Object.entries(filters.value).forEach(([key, value]) => {
        if (Object.prototype.hasOwnProperty.call(filters.value, key)) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await jwtInterceptor.get(requestPath, {
        withCredentials: true,
        params: searchParams
      })

      error.value = ''
      loading.value = false
      if (response.status >= 200 && response.status < 300) {
        matches.value.push(...response.data.map(transformMatchDTO))
      } else throw new Error(response.statusText)
      if (matches.value.length === 0) error.value = 'No Matches found!'
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error'
      error.value = message
      console.error('Error fetching match data from the backend:', e)
    }
  }

  async function getMatch(matchId: number) {
    const requestPath = baseUrlMatch
    const searchParams = new URLSearchParams()

    const localFilters: Filter = {
      gameStatus: GameStatus.CREATED,
      includePlayers: true,
      includeScores: true
    }

    try {
      loading.value = true

      Object.entries(localFilters).forEach(([key, value]) => {
        if (Object.prototype.hasOwnProperty.call(filters.value, key)) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await jwtInterceptor.get(requestPath + '/' + matchId, {
        withCredentials: true,
        params: searchParams
      })
      error.value = ''
      loading.value = false
      if (response.status >= 200 && response.status < 300) {
        currentMatch.value = transformMatchDTO(response.data)
        currentLeftPlayer.value = currentMatch.value.players[0].name
        currentRightPlayer.value = currentMatch.value.players[1].name
      } else throw new Error(response.statusText)
      if (matches.value.length === 0) error.value = 'No Matches found!'
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error'
      error.value = message
      console.error('Error fetching match data from the backend:', e)
    }
  }

  function transformMatchDTO(dto: MatchDTO): MatchMetaData {
    const result: MatchMetaData = {
      id: dto.id,
      start: dto.start ? new Date(dto.start) : undefined,
      end: dto.end ? new Date(dto.end) : undefined,
      players:
        dto.players?.map((player) => ({
          id: player.player.id,
          score: player.score,
          name: player.player.name,
          email: player.player.email
        })) || []
    }

    return result
  }

  async function getMatchHistory(scope: Scope) {
    filters.value.gameStatus = GameStatus.COMPLETED
    switch (scope) {
      case Scope.global:
        await getMatches()
        break
      case Scope.personal:
        await getMatches('/me')
        break
      default:
        console.error(`unexpected scope ${scope}`)
        break
    }
  }

  async function getMatchesToJoin() {
    filters.value = {
      gameStatus: GameStatus.CREATED,
      includePlayers: true,
      includeScores: false
    }
    await getMatches()
  }

  async function getMatchesToSpectate() {
    filters.value = {
      gameStatus: GameStatus.IN_PROGRESS,
      includePlayers: true,
      includeScores: true
    }
    await getMatches()
  }

  function clearFilters() {
    filters.value = {
      gameStatus: GameStatus.CREATED,
      includePlayers: false,
      includeScores: false
    }
  }

  async function fetchCurrentMatch() {
    const requestPath = baseUrlMatch + '/current'

    try {
      loading.value = true
      const response = await jwtInterceptor.get(requestPath, {
        withCredentials: true
      })
      error.value = ''
      loading.value = false
      if (response.status >= 200 && response.status < 300) {
        if (response.data) {
          joinMatch(response.data)
        }
      } else throw new Error(response.statusText)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error'
      error.value = message
      console.error('Error fetching current match data from the backend:', e)
    }
  }

  function removeCurrentMatch() {
    currentMatch.value = undefined
  }

  return {
    init,
    matches,
    currentMatch,
    loading,
    error,
    filters,
    player_number,
    clearFilters,
    joinMatch,
    matchCount,
    pagination,
    gameStates,
    createMatch,
    getMatches,
    getMatch,
    getMatchHistory,
    getMatchesToJoin,
    getMatchesToSpectate,
    removeCurrentMatch,
    fetchCurrentMatch,
    getLeftPlayer,
    getRightPlayer,
    currentLeftPlayer,
    currentRightPlayer
  }
})
