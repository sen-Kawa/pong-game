import usePagination from '@/components/match/usePagination'
import jwtInterceptor from '@/interceptor/jwtInterceptor'
import type { MatchDTO, MatchResult } from '@/types/match'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const baseUrlMatch = `${import.meta.env.VITE_BACKEND_SERVER_URI}/match`

interface Filter {
  started: boolean
  completed: boolean
  includePlayers: boolean
  includeScores: boolean
}

export const useMatchStore = defineStore('match', () => {
  // ref becomes state
  const matches = ref<MatchResult[]>([]) // TODO: use MatchResult interface
  const currentMatch = ref(null)
  const loading = ref(false)
  const error = ref('')

  const filters = ref<Filter>({
    started: true,
    completed: false,
    includePlayers: true,
    includeScores: true
  })

  // computed becomes getter
  const matchCount = computed(() => matches.value.length)
  const pagination = computed(() => usePagination(matches))

  // function becomes action
  async function createMatch() {
    const requestPath = baseUrlMatch + '/me'
    try {
      loading.value = true
      const response = await jwtInterceptor.post(
        requestPath,
        {},
        {
          withCredentials: true
        }
      )
      await new Promise((resolve) => setTimeout(resolve, 1000)) // TODO: remove debug delay

      error.value = ''
      loading.value = false
      console.debug(response)
      if (response.status != 201) {
        throw new Error(response.statusText)
      }
      console.debug(transformMatchDTOToResult(response.data))
      matches.value.push(transformMatchDTOToResult(response.data))
    } catch (e) {
      const message = error instanceof Error ? error.message : 'Unknown Error'
      error.value = message
      console.error('Failed to create match for current player', e)
      throw error
    }
  }

  async function getMatches(path?: string) {
    const requestPath = baseUrlMatch + (path ?? '')
    const searchParams = new URLSearchParams()

    try {
      loading.value = true

      Object.entries(filters.value).forEach(([key, value]) => {
        if (filters.value.hasOwnProperty(key)) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await jwtInterceptor.get(requestPath, {
        withCredentials: true,
        params: searchParams
      })
      await new Promise((resolve) => setTimeout(resolve, 1000)) // TODO: remove debug delay

      console.debug(response.status)
      error.value = ''
      loading.value = false
      if (response.status >= 200 && response.status < 300) {
        const rawMatchData: MatchDTO[] = response.data
        matches.value = response.data.map(transformMatchDTOToResult)
      } else throw new Error(response.statusText)
      if (matches.value.length === 0) error.value = 'No Matches found!'
    } catch (e) {
      const message = error instanceof Error ? error.message : 'Unknown Error'
      error.value = message
      console.error('Error fetching match data from the backend:', e)
    }
  }

  function transformMatchDTOToResult(dto: MatchDTO): MatchResult {
    const result: MatchResult = {
      id: dto.id,
      start: new Date(dto.start),
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

  async function getMatchHistory() {
    const matchFilter = filters.value

    matchFilter.completed = true
    getMatches()
  }

  async function getMatchesToJoin() {
    filters.value = {
      started: true,
      completed: false,
      includePlayers: true,
      includeScores: false
    }
    getMatches()
  }

  function clearFilters() {
    for (const key in filters.value) {
      filters.value[key as keyof typeof filters.value] = false // https://stackoverflow.com/a/69198602
    }
  }

  return {
    matches,
    currentMatch,
    loading,
    error,
    filters,
    clearFilters,
    matchCount,
    pagination,
    createMatch,
    getMatches,
    getMatchHistory,
    getMatchesToJoin
  }
})
