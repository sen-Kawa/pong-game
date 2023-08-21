import { ref, computed, type Ref, onMounted } from 'vue'
import type { MatchResult } from '@/types/match'

export default function usePagination(filteredSearchResults: Ref<MatchResult[]>) {
  const pageSize = 5 // TODO: make this a setting the user can change
  const currentPage = ref(1)

  const nextPage = () => {
    currentPage.value += 1
  }
  const prevPage = () => {
    currentPage.value -= 1
  }

  onMounted(() => console.log('Mounted: useSearch'))

  const currentStartIndex = computed(() => (currentPage.value - 1) * pageSize + 1)

  const currentEndIndex = computed(() => {
    const end = currentStartIndex.value - 1 + pageSize
    return end > filteredSearchResults.value.length ? filteredSearchResults.value.length : end
  })

  const pagedResults = computed(() => {
    const startIndex = currentStartIndex.value - 1
    const endIndex = currentEndIndex.value
    return filteredSearchResults.value.slice(startIndex, endIndex)
  })

  return {
    currentPage,
    nextPage,
    prevPage,
    pageSize,
    currentStartIndex,
    currentEndIndex,
    pagedResults
  }
}
