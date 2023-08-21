import { ref, onMounted, computed } from 'vue'

export default function useFilters() {
  const filters = ref({
    started: true,
    completed: false,
    includePlayers: true,
    includeScores: true
  })

  onMounted(() => console.log('Mounted: useFilters'))

  const clearFilters = () => {
    for (const key in filters.value) {
      filters.value[key as keyof typeof filters.value] = false // https://stackoverflow.com/a/69198602
    }
  }

  return {
    filters,
    clearFilters
  }
}
